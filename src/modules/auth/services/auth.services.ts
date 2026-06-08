import { prisma } from "@/lib/prisma";
import { loginSchema, RegisterInput, registerSchema, passwordSchema } from "../validators/auth.validators";
import crypto from "crypto";

import * as argon from "argon2"
import { sendVerificationEmail } from "../helpers/sendVerificationEmail";
import { createAuditLog } from "@/utils/audit-log";
import { AccountStatus, AuditEvent, Role } from "@/generated/prisma/enums";
import { createPasswordResetToken, createSession, deletePasswordResetTokenByUserId, deleteSessionByUserId, deleteVerificationTokenByUserId, findPasswordResetToken, findSessionByRefreshToken, findSessionBySessionId, findUserByEmail, findUserByUserId, revokeSessionByRefreshTokenHash, revokeSessionBySessionId, revokeSessionByUserId, storeVerificationToken, updateLastLogin, updateSessionBySessionId, updateUserPasswordByUserId } from "../repository/auth.repository";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../helpers/jwt";
import { hashToken } from "../helpers/hash-token";
import { cookies } from "next/headers";
import { clearAuthCookies } from "@/utils/cookies";
import { NextResponse } from "next/server";
import { blacklistToken } from "../helpers/token-blacklist";
import { success } from "zod";
import { errorResponse, successResponse } from "@/utils/response";
import { sendResetPasswordEmail } from "../helpers/sendResetPasswordEmail";
import { checkEmailCooldown, setEmailCooldown } from "../helpers/email-cooldown";

type LoginInput = {
    email: string;
    password: string;
}

type LoginRequestInfo = {
    ipAddress: string;
    device: string;
    browser: string;
}

export async function registerService(body: RegisterInput, requestInfo: { ipAddress: string, device: string }) {
    const validatedData = registerSchema.safeParse(body);

    if (!validatedData.success) {
        throw new Error(validatedData.error.issues[0].message);
    }

    const { name, email, password } = validatedData.data;
    const hashedPassword = await argon.hash(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = hashToken(verificationToken);
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const result =
        await prisma.$transaction(
            async (tx) => {
                const existingUser =
                    await tx.user.findUnique({
                        where: { email },
                    });

                if (existingUser) {
                    throw new Error(
                        "User already exists"
                    );
                }

                const user =
                    await tx.user.create({
                        data: {
                            name,
                            email,
                            password:
                                hashedPassword,
                        },
                    });

                await tx.verificationToken.create({
                    data: {
                        userId: user.id,
                        token:
                            hashedVerificationToken,
                        expiresAt:
                            tokenExpiry,
                    },
                });

                return {
                    user,
                    verificationToken,
                };
            },
            {
                maxWait: 10000,
                timeout: 10000,
            }
        );


    try {
        // Send verification email
        await sendVerificationEmail(result.user.email, result.verificationToken);
        await createAuditLog({
            userId: result.user.id,
            event: AuditEvent.ACCOUNT_CREATED,
            ipAddress: requestInfo.ipAddress,
            device: requestInfo.device,

        })
        await createAuditLog({
            userId: result.user.id,
            event: AuditEvent.VERIFICATION_EMAIL_SENT,
            ipAddress: requestInfo.ipAddress,
            device: requestInfo.device,
        })
    } catch {
        // rollback transaction if email sending fails, but user is created. This ensures data consistency and allows user to request new verification email if needed.
        await prisma.user.delete({
            where: {
                id: result.user.id
            }
        })

        throw new Error("Failed to send verification email, please try registering again");
    }
    return {
        user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
        }
    };
}

export async function verifyEmailService(rawToken: string) {
    if (!rawToken) {
        throw new Error("Verification token is required");
    }
    const hashedToken = hashToken(rawToken)
    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token: hashedToken },
        include: {
            user: true
        }
    })

    if (!verificationToken) {
        throw new Error("Invalid verification token");
    }

    if (verificationToken.expiresAt < new Date()) {
        // cleanup expired token
        await prisma.verificationToken.delete({
            where: { id: verificationToken.id }
        })
        throw new Error("Verification token has expired");
    }

    // already verified
    if (verificationToken.user.isVerified) {
        return {
            success: true,
            message: "Email is already verified"
        }
    }

    await prisma.$transaction([
        prisma.user.update({
            where: { id: verificationToken.userId },
            data: { isVerified: true }
        }),
        prisma.verificationToken.delete({
            where: { id: verificationToken.id }
        })

    ]);

    await createAuditLog({
        userId: verificationToken.userId,
        event: AuditEvent.EMAIL_VERIFIED,
    })

    return {
        success: true,
        message: "Email verified successfully"
    }
}

export async function loginService(body: LoginInput, requestInfo: LoginRequestInfo) {
    // zod validation for body
    const validatedData = loginSchema.safeParse(body);

    if (!validatedData.success) {
        throw new Error(validatedData.error.issues[0].message);
    }

    const { email, password } = validatedData.data;

    const user = await findUserByEmail(email);

    if (!user) {
        await createAuditLog({
            userId: "unknown",
            event: AuditEvent.LOGIN_FAILED,
            ipAddress: requestInfo.ipAddress,
            device: requestInfo.device,
            metadata: {
                email,
                reason: "User not found"
            }
        })

        throw new Error("Invalid email or password");
    }

    // verify password
    const isPasswordValid = await argon.verify(user.password ?? "", password);

    if (!isPasswordValid) {
        await createAuditLog({
            userId: user.id,
            event: AuditEvent.LOGIN_FAILED,
            ipAddress: requestInfo.ipAddress,
            device: requestInfo.device,
            metadata: {
                email,
                reason: "Invalid password"
            }
        })
        throw new Error("Invalid email or password");
    }

    if (!user.isVerified) {
        throw new Error("Email is not verified, please check your inbox for verification email");
    }

    if (user.status === AccountStatus.SUSPENDED || user.status === AccountStatus.BANNED) {
        throw new Error("Your account is suspended or banned, please contact support for more information");
    }

    // generate tokens


    const { token: refreshToken, jti } = generateRefreshToken(user.id)

    const refreshTokenHash = hashToken(refreshToken);

    const session = await createSession({
        userId: user.id,
        refreshTokenHash,
        ipAddress: requestInfo.ipAddress,
        device: requestInfo.device,
        browser: requestInfo.browser,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    })
    const accessToken = generateAccessToken(user.id, session.id, user.role);

    // udpate last login
    await updateLastLogin(user.id);

    await createAuditLog({
        userId: user.id,
        event: AuditEvent.LOGIN_SUCCESS,
        ipAddress: requestInfo.ipAddress,
        device: requestInfo.device,
        metadata: {
            sessionId: session.id,
            jti
        }
    })

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        accessToken,
        refreshToken
    }
}

export async function logoutFromCurrentOrAllDevicesService(device: string, requestInfo: { ipAddress: string, device: string }) {
    try {
        const cookieStore = await cookies();
        const accessToken =
            cookieStore.get("access_token")?.value;

        const refreshToken =
            cookieStore.get("refresh_token")?.value;

        if (!refreshToken) {
            const response = NextResponse.json({ success: true, message: "Already logout" }, { status: 200 })
            clearAuthCookies(response);
            return response;
        }

        // verify access token
        const accessPayload = verifyAccessToken(accessToken!);
        let responseMsg = "Logout successfully"
        if (device === "CURRENT") {
            await revokeSessionByRefreshTokenHash(hashToken(refreshToken))
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
        const response = NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );

        clearAuthCookies(response);

        return response;
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

    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
        throw new Error("Unauthorized")
    }

    const { sub } = verifyRefreshToken(refreshToken)
    const user = await findUserByUserId(sub);
    const refreshTokenHash = hashToken(refreshToken);

    const session = await findSessionByRefreshToken(refreshTokenHash)

    if (!session) {
        await deleteSessionByUserId(sub);
        throw new Error("Security issue detected. Login again.")
    }

    if (session.isRevoked) {
        throw new Error("Session not found")
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

export async function resendVerificationEmailService(email: string, requestInfo: { ipAddress: string, device: string }) {
    const user = await findUserByEmail(email)
    if (!user) {
        return successResponse("If this email exists, a verification email has been sent.", null, 200);
    }

    if (user.isVerified) {
        return errorResponse("Email is already verified", null, 400);
    }

    const cooldownKey = `email_cooldown:${user.id}:verification`;

    await checkEmailCooldown(cooldownKey);

    await deleteVerificationTokenByUserId(user.id);

    //generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = hashToken(verificationToken);
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await storeVerificationToken(user.id, hashedVerificationToken, tokenExpiry);

    await sendVerificationEmail(user.email, verificationToken);
    await setEmailCooldown(cooldownKey);
    await createAuditLog({
        userId: user.id,
        event: AuditEvent.VERIFICATION_EMAIL_SENT,
        ipAddress: requestInfo.ipAddress,
        device: requestInfo.device,
    })

    return successResponse("If this email exists, a verification email has been sent.", null, 200);
}