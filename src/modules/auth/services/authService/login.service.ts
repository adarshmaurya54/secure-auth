import { createAuditLog } from "@/utils/audit-log";
import { createSession, findUserByEmail, updateLastLogin } from "../../repository/auth.repository";
import { loginSchema } from "../../validators/auth.validators";
import { AccountStatus, AuditEvent } from "@/generated/prisma/enums";
import * as argon from "argon2"
import { generateAccessToken, generateRefreshToken } from "../../helpers/jwt";
import { hashToken } from "../../helpers/hash-token";
import { redis } from "@/lib/redis";
import { createTempMfaToken } from "../../helpers/temp-mfa-token";
import { createLoginSession } from "./create-login-session.service";
import { LoginResponse } from "../../types/auth.types";

type LoginInput = {
    email: string;
    password: string;
}

type LoginRequestInfo = {
    ipAddress: string;
    device: string;
    browser: string;
    os: string
}
export async function loginService(body: LoginInput, requestInfo: LoginRequestInfo): Promise<LoginResponse> {
    // zod validation for body
    const validatedData = loginSchema.safeParse(body);

    if (!validatedData.success) {
        throw new Error(validatedData.error.issues[0].message);
    }

    const { email, password } = validatedData.data;

    const user = await findUserByEmail(email);

    if (!user) {
        await createAuditLog({
            event: AuditEvent.LOGIN_FAILED,
            ipAddress: requestInfo.ipAddress,
            device: requestInfo.device,
            metadata: {
                email,
                reason: "User not found"
            }
        })

        throw new Error("Invalid email or password");
    }

    // verify password
    const isPasswordValid = await argon.verify(user.password ?? "", password);

    if (!isPasswordValid) {
        await createAuditLog({
            userId: user.id,
            event: AuditEvent.LOGIN_FAILED,
            ipAddress: requestInfo.ipAddress,
            device: requestInfo.device,
            metadata: {
                email,
                reason: "Invalid password"
            }
        })
        throw new Error("Invalid email or password");
    }

    if (user.mfaEnabled) {
        const tempToken = await createTempMfaToken(user.id); 
        return {
            mfaRequired: true,
            tempToken,
            user: null,
            accessToken: null,
            refreshToken: null
        }
    }

    if (user.status === AccountStatus.SUSPENDED || user.status === AccountStatus.BANNED) {
        throw new Error("Your account is suspended or banned, please contact support for more information");
    }

    return createLoginSession(user, requestInfo);
}