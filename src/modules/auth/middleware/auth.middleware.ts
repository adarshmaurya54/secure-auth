import { NextRequest } from "next/server";
import { verifyAccessToken } from "../helpers/jwt";
import { prisma } from "@/lib/prisma";
import { isTokenBlacklisted } from "../helpers/token-blacklist";
import { findUserByUserId } from "../repository/auth.repository";

type JwtPayload = {
    sub: string;
    sessionId: string;
    jti: string;
    role: string;
    exp: number
}

export async function authenticate(request: NextRequest) {
    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
        throw new Error("Unauthorized")
    }

    let payload: JwtPayload;

    try {
        payload = verifyAccessToken(accessToken) as JwtPayload;
    } catch {
        throw new Error("Invalid or Expire Token");
    }

    // check for blacklist token
    const isBlacklisted = await isTokenBlacklisted(payload.jti)

    if(isBlacklisted){
        throw new Error("Token revoked")
    }

    const user = await findUserByUserId(payload.sub)

    if (!user) {
        throw new Error("User not found")
    }

    if (!user.isVerified) {
        throw new Error("User is not verified, please verify you email.")
    }

    if (user.status !== "ACTIVE") {
        throw new Error("Account suspended");
    }

    return user;
}

export function requireRole(
    userRole: string,
    requiredRole: string
) {
    if (userRole !== requiredRole) {
        throw new Error("Forbidden");
    }
}