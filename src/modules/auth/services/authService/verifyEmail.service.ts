import { ApiError } from "next/dist/server/api-utils";
import { findUserByEmail } from "../../repository/auth.repository";
import { prisma } from "@/lib/prisma";
import * as argon from "argon2"
import { createAuditLog } from "@/utils/audit-log";
import { AuditEvent } from "@/generated/prisma/enums";

export async function verifyEmailService(email: string, code: string) {
    if (!email || !code) {
        throw new ApiError(
            400,
            "Email and verification code are required"
        );
    }

    // find user
    const user = await findUserByEmail(email);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // already verified
    if (user.isVerified) {
        return {
            success: true,
            message: "Email is already verified",
        };
    }

    // get verification record
    const verification = await prisma.verificationCode.findFirst({
            where: {
                userId: user.id,
            },
        });

    if (!verification) {
        throw new ApiError(404,
            "Verification code not found"
        );
    }

    // check expiry
    if (verification.expiresAt < new Date()) {
        await prisma.verificationCode.delete({
            where: {
                id: verification.id,
            },
        });

        throw new ApiError(410,
            "Verification code has expired"
        );
    }

    // verify code
    const isValid =
        await argon.verify(
            verification.codeHash,
            code
        );

    if (!isValid) {
        throw new ApiError(400,
            "Invalid verification code"
        );
    }

    // verify user + delete code
    await prisma.$transaction([
        prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                isVerified: true,
            },
        }),

        prisma.verificationCode.delete({
            where: {
                id: verification.id,
            },
        }),
    ]);

    await createAuditLog({
        userId: user.id,
        event: AuditEvent.EMAIL_VERIFIED,
    });

    return {
        success: true,
        message:
            "Email verified successfully",
    };
}