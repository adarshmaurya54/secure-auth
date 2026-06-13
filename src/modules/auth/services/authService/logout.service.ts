import { COOKIE_NAMES } from "@/constants";
import { clearAuthCookies } from "@/utils/cookies";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAccessToken } from "../../helpers/jwt";
import { hashToken } from "../../helpers/hash-token";
import { findSessionBySessionId, revokeAllSessions, revokeSessionByRefreshTokenHash, revokeSessionBySessionId } from "../../repository/auth.repository";
import { blacklistToken } from "../../helpers/token-blacklist";
import { createAuditLog } from "@/utils/audit-log";
import { AuditEvent } from "@/generated/prisma/enums";
import { handleApiError } from "@/lib/errors/handle-api-error";
import { ApiError } from "next/dist/server/api-utils";

export async function logoutCurrentDeviceService(accessToken: string, refreshToken: string,
    requestInfo: {
        ipAddress: string;
        device: string;
    }) {
    const accessPayload = verifyAccessToken(accessToken);

    // revoke only current session
    await revokeSessionByRefreshTokenHash(
        hashToken(refreshToken)
    );

    // blacklist access token
    const currentTime = Math.floor(Date.now() / 1000);

    const ttl = accessPayload.exp - currentTime;

    if (ttl > 0) {
        await blacklistToken(
            accessPayload.jti,
            ttl
        );
    }

    await createAuditLog({
        userId: accessPayload.sub,
        event: AuditEvent.LOGOUT,
        ipAddress:
            requestInfo.ipAddress,
        device:
            requestInfo.device,
        metadata: {
            action:
                "logout_current_device",
        },
    });
}

export async function logoutAllDevicesService(userId: string,accessToken: string) {
    const accessPayload = verifyAccessToken(accessToken);

    await revokeAllSessions(userId);

    const currentTime = Math.floor(Date.now() / 1000);

    const ttl = accessPayload.exp - currentTime;

    if (ttl > 0) {
        await blacklistToken(
            accessPayload.jti,
            ttl
        );
    }

    await createAuditLog({
        userId,
        event: AuditEvent.LOGOUT,
        metadata: {
            action:
                "logout_all_devices",
        },
    });
}

export async function logoutFromSpecificDeviceService(targetSessionId: string, currentSessionId: string, userId: string, requestInfo: { device: string; ipAddress: string }) {
    const session = await findSessionBySessionId(targetSessionId);

    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    if (session.isRevoked) {
        throw new ApiError(400, "Device already logged out");
    }

    // security check
    if (session.userId !== userId) {
        throw new ApiError(403, "You are not allowed to revoke this session");
    }

    // prevent current device revoke
    if (session.id === currentSessionId) {
        throw new ApiError(400, "Use logout endpoint for current device");
    }

    await revokeSessionBySessionId(session.id);

    await createAuditLog({
        userId,
        event: AuditEvent.LOGOUT,
        ipAddress: requestInfo.ipAddress,
        device: requestInfo.device,
        metadata: {
            revokedSessionId: session.id,
            revokedDevice: session.device,
            revokedBrowser: session.browser,
        }
    });

    return {
        message: "Device logged out successfully",
    };
}