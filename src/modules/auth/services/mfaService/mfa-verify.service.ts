import { createAuditLog } from "@/utils/audit-log";
import { decryptSecret } from "../../helpers/mfa-crypto";
import { deleteTempMfaToken, validateTempMfaToken } from "../../helpers/temp-mfa-token";
import { findUserByUserId } from "../../repository/auth.repository";
import { LoginRequestInfo } from "../../types/auth.types";
import * as OTPLib from "otplib";
import { AuditEvent } from "@/generated/prisma/enums";
import { ApiError } from "next/dist/server/api-utils";
import { createLoginSession } from "../authService/create-login-session.service";

type VerifyInput = {
    tempToken: string;
    code: string;
}
export async function mfaVerifyService(
    body: VerifyInput,
    requestInfo: LoginRequestInfo
) {
    const userId = await validateTempMfaToken(body.tempToken);

    const user = await findUserByUserId(userId);

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.mfaSecret) {
        throw new Error("MFA not configured");
    }

    const secret = decryptSecret(user.mfaSecret);

    const result = await OTPLib.verify({
        token: body.code,
        secret
    });

    if (!result.valid) {
        await createAuditLog({
            userId,
            event: AuditEvent.MFA_VERIFY_FAILED,
            metadata: {}
        });

        throw new ApiError(400, "Invalid MFA code");
    }

    await deleteTempMfaToken(body.tempToken);

    await createAuditLog({
        userId,
        event: AuditEvent.MFA_VERIFY_SUCCESS,
        metadata: {}
    });

    return createLoginSession(
        user,
        requestInfo
    );
}
