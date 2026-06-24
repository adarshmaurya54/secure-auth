
import { ApiError } from "@/lib/errors/api-error";
import { findUserByUserId } from "../../repository/auth.repository";
import * as OTPLib from "otplib";
import qrcode from "qrcode";
import { savePendingMfaSecret } from "../../repository/mfa.repository";
import { encryptSecret } from "../../helpers/mfa-crypto";
import { createAuditLog } from "@/utils/audit-log";
import { AuditEvent } from "@/generated/prisma/enums";
import { redis } from "@/lib/redis";


export async function mfaSetupService(userId: string) {
    const user = await findUserByUserId(userId)
    
    if (!user) throw new ApiError(404, "User not found");
    if (user.mfaEnabled) throw new ApiError(400, "MFA already enabled");

    // generate secrete
    const secret = OTPLib.generateSecret();
    
    // uri for the qrcode
    const otpauth = OTPLib.generateURI({ issuer: process.env.APP_NAME || "SecureAuth", label: user.email, secret });
    const qrCodeUrl = await qrcode.toDataURL(otpauth);
    
    await savePendingMfaSecret(userId, encryptSecret(secret))
    
    await createAuditLog({
        userId,
        event: AuditEvent.MFA_SETUP_STARTED,
        metadata: {}
    });
    await redis.del(`user:${userId}`)
    return {
        qrCodeUrl,
        secret
    };
    
}




