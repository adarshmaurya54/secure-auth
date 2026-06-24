import * as OTPLib from "otplib";
import { findUserByUserId } from "../../repository/auth.repository";
import { disableMfa } from "../../repository/mfa.repository";
import { createAuditLog } from "@/utils/audit-log";
import { AuditEvent } from "@/generated/prisma/enums";
import { decryptSecret } from "../../helpers/mfa-crypto";
import { ApiError } from "next/dist/server/api-utils";
import { redis } from "@/lib/redis";

export async function mfaDisableService(
    userId: string,
    code: string
) {
    const user = await findUserByUserId(userId);
    
    if (!user) throw new ApiError(404, "User not found");
    
    if (!user.mfaSecret) throw new ApiError(400, "MFA not configured");

    const secret = decryptSecret(user.mfaSecret);

    const result = await OTPLib.verify({
        token: code,
        secret
    });

    if (!result.valid) {
        throw new ApiError(400, "Invalid MFA code");
    }

    await disableMfa(userId);

    await redis.del(`user:${userId}`)

    await createAuditLog({
        userId,
        event: AuditEvent.MFA_DISABLED,
        metadata: {}
    });
}