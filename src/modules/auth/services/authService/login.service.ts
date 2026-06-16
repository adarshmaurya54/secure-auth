import { createAuditLog } from "@/utils/audit-log";
import { createSession, findUserByEmail, updateLastLogin } from "../../repository/auth.repository";
import { loginSchema } from "../../validators/auth.validators";
import { AccountStatus, AuditEvent } from "@/generated/prisma/enums";
import * as argon from "argon2"
import { generateAccessToken, generateRefreshToken } from "../../helpers/jwt";
import { hashToken } from "../../helpers/hash-token";
import { redis } from "@/lib/redis";

type LoginInput = {
    email: string;
    password: string;
}

type LoginRequestInfo = {
    ipAddress: string;
    device: string;
    browser: string;
    os: string
}
export async function loginService(body: LoginInput, requestInfo: LoginRequestInfo) {
    // zod validation for body
    const validatedData = loginSchema.safeParse(body);

    if (!validatedData.success) {
        throw new Error(validatedData.error.issues[0].message);
    }

    console.log("Login service is called")

    const { email, password } = validatedData.data;

    const user = await findUserByEmail(email);

    if (!user) {
        await createAuditLog({
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
        os: requestInfo.os,

        expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        )
    })
    const accessToken = generateAccessToken(user.id, session.id, user.role);

    // udpate last login
    await updateLastLogin(user.id);
    const r = await redis.del(`sessions:${user.id}`);
    console.log("redis key deleted", r);

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
            isVerified: user.isVerified,
            role: user.role
        },
        accessToken,
        refreshToken
    }
}