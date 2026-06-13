import { prisma } from "@/lib/prisma";
import { loginSchema, RegisterInput, registerSchema, passwordSchema } from "../validators/auth.validators";
import crypto from "crypto";

import * as argon from "argon2"
import { sendVerificationEmail } from "../helpers/sendVerificationEmail";
import { createAuditLog } from "@/utils/audit-log";
import { AccountStatus, AuditEvent, Role } from "@/generated/prisma/enums";
import { createPasswordResetToken, createSession, deletePasswordResetTokenByUserId, deleteSessionByUserId, findPasswordResetToken, findSessionByRefreshToken, findSessionBySessionId, findUserByEmail, findUserByUserId, revokeSessionByRefreshTokenHash, revokeSessionBySessionId, revokeSessionByUserId, updateLastLogin, updateSessionBySessionId, updateUserPasswordByUserId } from "../repository/auth.repository";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../helpers/jwt";
import { hashToken } from "../helpers/hash-token";
import { cookies } from "next/headers";
import { clearAuthCookies } from "@/utils/cookies";
import { NextResponse } from "next/server";
import { blacklistToken } from "../helpers/token-blacklist";
import { errorResponse, successResponse } from "@/utils/response";
import { sendResetPasswordEmail } from "../helpers/sendResetPasswordEmail";
import { checkEmailCooldown, setEmailCooldown } from "../helpers/email-cooldown";
import { handleApiError } from "@/lib/errors/handle-api-error";
import { ApiError } from "@/lib/errors/api-error";
import { COOKIE_NAMES } from "@/constants";

// export async function verifyEmailService(rawToken: string) {
//     if (!rawToken) {
//         throw new ApiError(200,"Verification token is required");
//     }
//     const hashedToken = hashToken(rawToken)
//     const verificationToken = await prisma.verificationToken.findUnique({
//         where: { token: hashedToken },
//         include: {
//             user: true
//         }
//     })

//     if (!verificationToken) {
//         throw new Error("Invalid verification token");
//     }

//     if (verificationToken.expiresAt < new Date()) {
//         // cleanup expired token
//         await prisma.verificationToken.delete({
//             where: { id: verificationToken.id }
//         })
//         throw new Error("Verification token has expired");
//     }

//     // already verified
//     if (verificationToken.user.isVerified) {
//         return {
//             success: true,
//             message: "Email is already verified"
//         }
//     }

//     await prisma.$transaction([
//         prisma.user.update({
//             where: { id: verificationToken.userId },
//             data: { isVerified: true }
//         }),
//         prisma.verificationToken.delete({
//             where: { id: verificationToken.id }
//         })

//     ]);

//     await createAuditLog({
//         userId: verificationToken.userId,
//         event: AuditEvent.EMAIL_VERIFIED,
//     })

//     return {
//         success: true,
//         message: "Email verified successfully"
//     }
// }






export async function logoutFromCurrentOrAllDevicesService(device: string, requestInfo: { ipAddress: string, device: string }) {
    try {
        const cookieStore = await cookies();
        const accessToken =
            cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

        const refreshToken =
            cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

        if (!refreshToken) {
            const response = NextResponse.json({ success: true, message: "Already logout" }, { status: 200 })
            clearAuthCookies(response);
            return response;
        }

        // verify access token
        const accessPayload = verifyAccessToken(accessToken!);
        let responseMsg = "Logout successfully"
        if (device === "CURRENT") {
            console.log("Logout -current")
            await revokeSessionByRefreshTokenHash(hashToken(refreshToken))
            console.log("revoked")
        } else if (device === "ALL") {
            await revokeSessionByUserId(accessPayload.sub)
            responseMsg = "You logged out from all devices."
        }

        // calculating ramaining expiry

        const currentTime = Math.floor(Date.now() / 1000);

        const ttl = accessPayload.exp - currentTime;

        // blacklist token
        if (ttl > 0) {

            await blacklistToken(accessPayload.jti, ttl)
        }

        await createAuditLog({
            userId: accessPayload.sub,
            event: AuditEvent.LOGOUT,
            ipAddress: requestInfo.ipAddress,
            device: requestInfo.device,
            metadata: {
                logout: device === "CURRENT" ? "Logged out from current device" : "Logged out from all devices"
            }
        })

        const response = NextResponse.json({
            success: true,
            message: responseMsg,
        }, { status: 200 })

        clearAuthCookies(response);

        return response;
    } catch (err) {
        return handleApiError(err);
    }

}

export async function logoutFromSpecificDeviceService(sessionId: string, userId: string, requestInfo: { device: string, ipAddress: string }) {
    const session = await findSessionBySessionId(sessionId);

    if (!session) {
        throw new Error('Session not found')
    }

    if (session.isRevoked) {
        throw new Error('Already logged out')
    }

    // Security check
    if (session.userId !== userId) {
        throw new Error("Unauthorized")
    }

    await revokeSessionBySessionId(session.id)

    await createAuditLog({
        userId,
        event: AuditEvent.LOGOUT,
        ipAddress: requestInfo.ipAddress,
        device: requestInfo.device,
        metadata: {
            logout: "Logout from device " + requestInfo.device,
        }
    })

    return {
        message: "Device logged out successfully"
    }
}




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
    await revokeSessionByUserId(token.user.id);

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

