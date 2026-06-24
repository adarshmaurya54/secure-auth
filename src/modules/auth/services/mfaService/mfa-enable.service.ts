import { ApiError } from "next/dist/server/api-utils";
import { findUserByUserId } from "../../repository/auth.repository";
import { decryptSecret, encryptSecret } from "../../helpers/mfa-crypto";
import * as OTPLib from "otplib";
import { generateBackupCodes } from "../../helpers/backup-codes";
import { enableMfa } from "../../repository/mfa.repository";
import { createAuditLog } from "@/utils/audit-log";
import { AuditEvent } from "@/generated/prisma/enums";
import { redis } from "@/lib/redis";

export async function mfaEnableService(userId: string, code: string) {
    const user = await findUserByUserId(userId);

    if (!user) throw new ApiError(404, "User not found");

    if (user.mfaEnabled) throw new ApiError(400, "MFA already enabled");

    if (!user.mfaPendingSecret) throw new ApiError(404, "No MFA setup found");

    const secret = decryptSecret(user.mfaPendingSecret);

    const result = await OTPLib.verify({ token: code, secret })

    if (!result.valid) throw new ApiError(400, "Invalid MFA code");

    const { hashedCodes, plainCodes } = await generateBackupCodes()

    await enableMfa(userId, {
        mfaSecret: encryptSecret(secret),
        mfaBackupCodes: hashedCodes
    })

    await createAuditLog({
        userId,
        event: AuditEvent.MFA_ENABLED,
        metadata: {}
    });
    await redis.del(`user:${userId}`)
    return {
        backupCodes: plainCodes
    };
}