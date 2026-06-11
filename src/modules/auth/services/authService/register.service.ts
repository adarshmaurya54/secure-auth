import { RegisterInput, registerSchema } from "../../validators/auth.validators";
import * as argon from "argon2"
import crypto from "crypto"
import { hashToken } from "../../helpers/hash-token";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "../../helpers/sendVerificationEmail";
import { createAuditLog } from "@/utils/audit-log";
import { AuditEvent } from "@/generated/prisma/enums";
export async function registerService(body: RegisterInput, requestInfo: { ipAddress: string, device: string }) {
    const validatedData = registerSchema.safeParse(body);

    if (!validatedData.success) {
        throw new Error(validatedData.error.issues[0].message);
    }

    const { name, email, password } = validatedData.data;
    const hashedPassword = await argon.hash(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = hashToken(verificationToken);
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const result =
        await prisma.$transaction(
            async (tx) => {
                const existingUser =
                    await tx.user.findUnique({
                        where: { email },
                    });

                if (existingUser) {
                    throw new Error(
                        "User already exists"
                    );
                }

                const user =
                    await tx.user.create({
                        data: {
                            name,
                            email,
                            password:
                                hashedPassword,
                        },
                    });

                await tx.verificationToken.create({
                    data: {
                        userId: user.id,
                        token:
                            hashedVerificationToken,
                        expiresAt:
                            tokenExpiry,
                    },
                });

                return {
                    user,
                    verificationToken,
                };
            },
            {
                maxWait: 10000,
                timeout: 10000,
            }
        );


    try {
        // Send verification email
        await sendVerificationEmail(result.user.email, result.verificationToken);
        await createAuditLog({
            userId: result.user.id,
            event: AuditEvent.ACCOUNT_CREATED,
            ipAddress: requestInfo.ipAddress,
            device: requestInfo.device,

        })
        await createAuditLog({
            userId: result.user.id,
            event: AuditEvent.VERIFICATION_EMAIL_SENT,
            ipAddress: requestInfo.ipAddress,
            device: requestInfo.device,
        })
    } catch {
        // rollback transaction if email sending fails, but user is created. This ensures data consistency and allows user to request new verification email if needed.
        await prisma.user.delete({
            where: {
                id: result.user.id
            }
        })

        throw new Error("Failed to send verification email, please try registering again");
    }
    return {
        user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
        }
    };
}
