import { prisma } from "@/lib/prisma";
import { loginSchema, RegisterInput, registerSchema } from "../validators/auth.validators";
import crypto from "crypto";

import * as argon from "argon2"
import { errorResponse, successResponse } from "@/utils/response";
import { sendVerificationEmail } from "../helpers/sendVerificationEmail";
import { createAuditLog } from "@/utils/audit-log";
import { AccountStatus, AuditEvent, Role } from "@/generated/prisma/enums";
import { createSession, deleteSessionByRefreshToken, deleteSessionBySessionId, deleteSessionByUserId, findSessionByRefreshToken, findUserByEmail, findUserByUserId, updateLastLogin } from "../repository/auth.repository";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../helpers/jwt";
import { hashToken } from "../helpers/hash-token";
import { cookies } from "next/headers";
import { clearAuthCookies } from "@/utils/cookies";
import { NextResponse } from "next/server";
import { blacklistToken } from "../helpers/token-blacklist";

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

    const accessToken = generateAccessToken(user.id, user.role);

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

export async function logoutFromCurrentDeviceSevice() {
    try {
        const cookieStore = await cookies();
        const accessToken =
            cookieStore.get("access_token")?.value;

        const refreshToken =
            cookieStore.get("refresh_token")?.value;

            console.log(accessToken, refreshToken)


        if (!refreshToken) {
            const response = NextResponse.json({ success: true, message: "Already logout" }, { status: 200 })
            clearAuthCookies(response);
            return response;
        }

        // verify access token
        const accessPayload = verifyAccessToken(accessToken!);
        // verify refresh token
        const refreshPayload = verifyRefreshToken(refreshToken);

        await deleteSessionByRefreshToken(refreshPayload.sub)

        // calculating ramaining expiry

        const currentTime = Math.floor(Date.now() / 1000);

        const ttl = accessPayload.exp - currentTime;

        // blacklist token
        if (ttl > 0) {
            await blacklistToken(accessPayload.jti, ttl)
        }

        const response = NextResponse.json({
            success: true,
            message: "Logged out successfully",
        }, { status: 200 })

        clearAuthCookies(response);

        return response;
    } catch {
        const response = NextResponse.json(
            {
                success: true,
                message: "Logged out",
            },
            { status: 200 }
        );

        clearAuthCookies(response);

        return response;
    }

}


export async function refreshTokenRotationService(requestInfo: LoginRequestInfo) {
    const cookieStore = await cookies();

    const refreshToken = cookieStore.get("refresh_token")?.value;

    if(!refreshToken){
        throw new Error("Unauthorized")
    }

    const {sub} = verifyRefreshToken(refreshToken)
    const user = await findUserByUserId(sub);
    const refreshTokenHash = hashToken(refreshToken);

    const session = await findSessionByRefreshToken(refreshTokenHash)

    if(!session) {
        await deleteSessionByUserId(sub);
        throw new Error("Security issue detected. Login again.")
    }


    // delete the old session
    await deleteSessionBySessionId(session.id)

    const newAccessToken = generateAccessToken(sub, user?.role ?? Role.USER)
    const {token: newRefreshToken, jti} = generateRefreshToken(sub)

    const newRefreshTokenHash = hashToken(newRefreshToken);

    const newSession = await createSession({
        userId: user?.id!,
        refreshTokenHash: newRefreshTokenHash,
        ipAddress: requestInfo.ipAddress,
        device: requestInfo.device,
        browser: requestInfo.browser,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    })

    return {
        newSession,
        newRefreshToken,
        newAccessToken
    }
}