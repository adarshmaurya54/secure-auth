import { AuditEvent, Role } from "@/generated/prisma/enums";
import { generateAccessToken, generateRefreshToken } from "../../helpers/jwt";
import { hashToken } from "../../helpers/hash-token";
import { createSession, updateLastLogin } from "../../repository/auth.repository";
import { redis } from "@/lib/redis";
import { createAuditLog } from "@/utils/audit-log";
import { LoginRequestInfo, LoginUser } from "../../types/auth.types";

export async function createLoginSession(user: LoginUser, requestInfo: LoginRequestInfo) {
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
    await redis.del(`sessions:${user.id}`);

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
        mfaRequired: false,
        tempToken: null,
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