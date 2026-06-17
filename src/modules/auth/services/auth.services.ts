import { passwordSchema } from "../validators/auth.validators";
import crypto from "crypto";

import * as argon from "argon2"
import { createAuditLog } from "@/utils/audit-log";
import { AuditEvent, Role } from "@/generated/prisma/enums";
import { createPasswordResetToken, deletePasswordResetTokenByUserId, deleteSessionByUserId, findPasswordResetToken, findSessionByRefreshToken, findUserByEmail, findUserByUserId, revokeAllSessions,  updateSessionBySessionId, updateUserPasswordByUserId } from "../repository/auth.repository";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../helpers/jwt";
import { hashToken } from "../helpers/hash-token";
import { cookies } from "next/headers";
import { errorResponse, successResponse } from "@/utils/response";
import { sendResetPasswordEmail } from "../helpers/sendResetPasswordEmail";
import { checkEmailCooldown, setEmailCooldown } from "../helpers/email-cooldown";
import { ApiError } from "@/lib/errors/api-error";
import { COOKIE_NAMES } from "@/constants";




export async function refreshTokenRotationService() {
    const cookieStore = await cookies();

    const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

    if (!refreshToken) {
        throw new ApiError(401, "Unauthorized", "UNAUTHORIZED")
    }

    const { sub } = verifyRefreshToken(refreshToken)
    const user = await findUserByUserId(sub);
    const refreshTokenHash = hashToken(refreshToken);

    const session = await findSessionByRefreshToken(refreshTokenHash)

    if (!session) {
        await deleteSessionByUserId(sub);
        throw new ApiError(401, "Security issue detected. Login again.", "SESSION_INVALID")
    }

    if (session.isRevoked) {
        throw new ApiError(401, "Session not found", "SESSION_NOT_FOUND")
    }

    const newAccessToken = generateAccessToken(sub, session.id, user?.role ?? Role.USER)
    const { token: newRefreshToken, jti } = generateRefreshToken(sub)

    const newRefreshTokenHash = hashToken(newRefreshToken);
    const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    // update the old session
    await updateSessionBySessionId(session.id, newRefreshTokenHash, newExpiry)

    return {
        newRefreshToken,
        newAccessToken
    }
}

export async function forgotPasswordService(email: string, requestInfo: { ipAddress: string, device: string }) {
    // find user by email
    const user = await findUserByEmail(email);
    if (!user) {
        return successResponse("If this email exist, a reset link was sent.", null, 200);
    }

    await deletePasswordResetTokenByUserId(user.id);

    const token = crypto.randomBytes(32).toString("hex")
    const hashPasswordResetToken = hashToken(token);
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 24 hours from now

    await createPasswordResetToken(user.id, hashPasswordResetToken, tokenExpiry);

    try {
        const cooldownKey = `email_cooldown:${user.id}:verification`;
        // cooldown 60 seconds between the email
        await checkEmailCooldown(cooldownKey);
        await sendResetPasswordEmail(user.email, token);
        await setEmailCooldown(cooldownKey);
        await createAuditLog({
            userId: user.id,
            event: AuditEvent.PASSWORD_RESET_REQUESTED,
            ipAddress: requestInfo.ipAddress,
            device: requestInfo.device
        })
        await createAuditLog({
            userId: user.id,
            event: AuditEvent.VERIFICATION_RESET_PASSWORD_EMAIL_SENT,
            ipAddress: requestInfo.ipAddress,
            device: requestInfo.device
        })
    } catch (error) {
        await deletePasswordResetTokenByUserId(user.id);
    }

    return successResponse("If this email exist, a reset link was sent.", null, 200);
}

export async function resetPasswordService(tokenHash: string, newPassword: string, requestInfo: { ipAddress: string, device: string }) {
    const hashPasswordResetToken = hashToken(tokenHash);
    const token = await findPasswordResetToken(hashPasswordResetToken)
    if (!token) {
        return errorResponse("Invalid or expired token", null, 400)
    }

    const tokenExpiry = token.expiresAt;
    const currentTime = new Date();

    if (tokenExpiry < currentTime) {
        await deletePasswordResetTokenByUserId(token.user.id);
        return errorResponse("Expired token", null, 400)
    }

    // Validate input
    const validatedData = passwordSchema.safeParse({ password: newPassword });

    if (!validatedData.success) {
        return errorResponse(validatedData.error.issues[0].message, "null value", 400);
    }

    const { password } = validatedData.data;
    const hashNewPassword = await argon.hash(password);

    await updateUserPasswordByUserId(token.user.id, hashNewPassword);

    // revoke all devices sessions
    await revokeAllSessions(token.user.id);

    // delete the password reset token
    await deletePasswordResetTokenByUserId(token.user.id);

    await createAuditLog({
        userId: token.user.id,
        event: AuditEvent.PASSWORD_CHANGED,
        ipAddress: requestInfo.ipAddress,
        device: requestInfo.device,
    })
    return successResponse("Password reset successful. Please login.", null, 200)
}

