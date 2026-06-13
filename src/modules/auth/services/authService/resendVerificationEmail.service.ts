import { errorResponse, successResponse } from "@/utils/response";
import { deleteVerificationCodeByUserId, findUserByEmail, storeVerificationCode } from "../../repository/auth.repository";
import { checkEmailCooldown, setEmailCooldown } from "../../helpers/email-cooldown";
import * as argon from "argon2"
import { sendVerificationEmail } from "../../helpers/sendVerificationEmail";
import { createAuditLog } from "@/utils/audit-log";
import { AuditEvent } from "@/generated/prisma/enums";

export async function resendVerificationEmailService(email: string, requestInfo: { ipAddress: string, device: string }) {
    const user = await findUserByEmail(email)
    if (!user) {
        return successResponse("If this email exists, a verification email has been sent.", null, 200);
    }

    if (user.isVerified) {
        return errorResponse("Email is already verified", null, 400);
    }

    const cooldownKey = `email_cooldown:${user.id}:verification`;

    await checkEmailCooldown(cooldownKey);

    await deleteVerificationCodeByUserId(user.id);

    //generate verification token
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedVerificationCode = await argon.hash(verificationCode);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await storeVerificationCode(user.id, hashedVerificationCode, expiresAt);

    await sendVerificationEmail(user.email, verificationCode);
    await setEmailCooldown(cooldownKey);
    await createAuditLog({
        userId: user.id,
        event: AuditEvent.VERIFICATION_EMAIL_SENT,
        ipAddress: requestInfo.ipAddress,
        device: requestInfo.device,
    })

    return successResponse("If this email exists, a verification email has been sent.", null, 200);
}