import { NextRequest } from "next/server";
import { verifyAccessToken } from "../helpers/jwt";
import { isTokenBlacklisted } from "../helpers/token-blacklist";
import { findUserByUserId } from "../repository/auth.repository";
import { ApiError } from "@/lib/errors/api-error";

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
            "Unauthorized"
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
            "Token revoked"
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

    if (!user.isVerified) {
        throw new ApiError(
            403,
            "Please verify your email"
        );
    }

    if (
        user.status !== "ACTIVE"
    ) {
        throw new ApiError(
            403,
            "Account suspended"
        );
    }

    return user;
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