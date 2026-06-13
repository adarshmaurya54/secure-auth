import { NextRequest } from "next/server";
import { verifyAccessToken } from "../helpers/jwt";
import { isTokenBlacklisted } from "../helpers/token-blacklist";
import { findSessionBySessionId, findUserByUserId, updateSessionActivity } from "../repository/auth.repository";
import { ApiError } from "@/lib/errors/api-error";
import { AccountStatus } from "@/generated/prisma/enums";

type JwtPayload = {
    sub: string;
    sessionId: string;
    jti: string;
    role: string;
    exp: number;
};

export async function authenticate(
    request: NextRequest
) {
    const accessToken =
        request.cookies.get(
            "access_token"
        )?.value;

    if (!accessToken) {
        throw new ApiError(
            401,
            "Unauthorized",
            "UNAUTHORIZED"
        );
    }

    let payload: JwtPayload;

    try {
        payload = verifyAccessToken(
            accessToken
        ) as JwtPayload;
    } catch {
        throw new ApiError(
            401,
            "Invalid or expired token"
        );
    }

    const isBlacklisted =
        await isTokenBlacklisted(
            payload.jti
        );

    if (isBlacklisted) {
        throw new ApiError(
            401,
            "Token revoked",
            "SESSION_REVOKED"
        );
    }

    const session = await findSessionBySessionId(
        payload.sessionId
    );

    if (!session || session.isRevoked) {
        throw new ApiError(
            401,
            "Session expired"
        );
    }

    const user =
        await findUserByUserId(
            payload.sub
        );

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }
    await updateSessionActivity(
        payload.sessionId
    );

    if (!user.isVerified) {
        throw new ApiError(
            403,
            "Please verify your email"
        );
    }

    if (user.status === AccountStatus.SUSPENDED) {
        throw new Error(
            "Your account has been suspended"
        );
    }

    if (user.status === AccountStatus.BANNED) {
        throw new Error(
            "Your account has been banned"
        );
    }

    return { user, sessionId: payload.sessionId };
}

export function requireRole(
    userRole: string,
    requiredRole: string
) {
    if (
        userRole !== requiredRole
    ) {
        throw new ApiError(
            403,
            "Forbidden"
        );
    }
}