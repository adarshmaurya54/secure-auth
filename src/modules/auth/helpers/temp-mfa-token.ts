import crypto from "crypto";
import { redis } from "@/lib/redis";
import { hashToken } from "./hash-token";
import { ApiError } from "next/dist/server/api-utils";

export async function createTempMfaToken(userId: string) {
    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = hashToken(token);

    await redis.set(
        `mfa:${tokenHash}`,
        userId,
        "EX",
        300
    );

    return token;
}

export async function validateTempMfaToken(token: string) {
    const tokenHash = hashToken(token);

    const userId = await redis.get(
        `mfa:${tokenHash}`
    );

    if (!userId) {
        throw new ApiError(
            400,
            "Session expired, please login again"
        );
    }

    return userId;
}

export async function deleteTempMfaToken(token: string) {
    const tokenHash = hashToken(token);

    await redis.del(
        `mfa:${tokenHash}`
    );
}