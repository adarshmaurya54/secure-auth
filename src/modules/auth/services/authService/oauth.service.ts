import { NextRequest, NextResponse } from "next/server";
import {
    createOAuthAccount,
    createOAuthUser,
    findOAuthAccount,
} from "../../repository/oauth.repository";
import { Provider } from "@/generated/prisma/enums";
import {
    findUserByEmail,
    updateLastLogin,
} from "../../repository/auth.repository";
import { createAuditLog } from "@/utils/audit-log";
import { createUserSession } from "../../helpers/create-user-session";
import { getDeviceInfo } from "../../helpers/device-info";
import { getIpAddress } from "../../helpers/ip-address";
import { redis } from "@/lib/redis";
import { createTempMfaToken } from "../../helpers/temp-mfa-token";

type HandleGoogleLoginParams = {
    email: string;
    name: string;
    providerAccountId: string;
    request: NextRequest;
    response?: NextResponse
};


export async function handleGoogleLogin({
    email,
    name,
    providerAccountId,
    request,
    response
}: HandleGoogleLoginParams) {
    const { device } = getDeviceInfo(request);
    const ipAddress = getIpAddress(request);

    console.log("oauth called ---------------------------------------------------------------------")
    // -----------------------------------------
    // 1. Check OAuth Account Exists
    // -----------------------------------------

    const existingOAuthAccount = await findOAuthAccount(
        Provider.GOOGLE,
        providerAccountId
    );

    // -----------------------------------------
    // CASE 1:
    // Existing OAuth User
    // -----------------------------------------

    if (existingOAuthAccount) {
        const user = existingOAuthAccount.user;

        // Suspended/Banned check
        if (user.status !== "ACTIVE") {
            throw new Error("Account is suspended");
        }

        // update last login
        // optional repository function
        await updateLastLogin(user.id);

        // audit log
        await createAuditLog({
            userId: user.id,
            event: "OAUTH_LOGIN",
            ipAddress,
            device,
            metadata: {
                provider: "GOOGLE",
            },
        });
        const r = await redis.del(`sessions:${user.id}`);
        console.log("redis key deleted", r, user.id);
        if (user.mfaEnabled) {

            const tempToken =
                await createTempMfaToken(
                    user.id
                );

            return NextResponse.redirect(
                `${process.env.APP_URL}/oauth-mfa?tempToken=${tempToken}`
            );
        }


        return createUserSession({
            user,
            request,
            response
        });
    }

    // -----------------------------------------
    // 2. Check Existing Email User
    // -----------------------------------------

    const existingUser = await findUserByEmail(email);

    // -----------------------------------------
    // CASE 2:
    // Existing Credentials User
    // Link Google Account
    // -----------------------------------------

    if (existingUser) {
        // account suspended check
        if (existingUser.status !== "ACTIVE") {
            throw new Error("Account is suspended");
        }

        // link Google account
        await createOAuthAccount({
            userId: existingUser.id,
            provider: Provider.GOOGLE,
            providerAccountId,
            email,
        });

        // audit log
        await createAuditLog({
            userId: existingUser.id,
            event: "OAUTH_LINKED",
            ipAddress,
            device,
            metadata: {
                provider: "GOOGLE",
                email,
            },
        });

        await createAuditLog({
            userId: existingUser.id,
            event: "OAUTH_LOGIN",
            ipAddress,
            device,
            metadata: {
                provider: "GOOGLE",
            },
        });

        const r = await redis.del(`sessions:${existingUser.id}`);
        console.log("redis key deleted", r, existingUser.id);

        if (existingUser.mfaEnabled) {

            const tempToken =
                await createTempMfaToken(
                    existingUser.id
                );

            return NextResponse.redirect(
                `${process.env.APP_URL}/oauth-mfa?tempToken=${tempToken}`
            );
        }

        return createUserSession({
            user: existingUser,
            request,
            response
        });
    }

    // -----------------------------------------
    // CASE 3:
    // Brand New User
    // -----------------------------------------

    const newUser = await createOAuthUser({
        name,
        email,
    });

    // create oauth account
    await createOAuthAccount({
        userId: newUser.id,
        provider: Provider.GOOGLE,
        providerAccountId,
        email,
    });

    // audit logs
    await createAuditLog({
        userId: newUser.id,
        event: "ACCOUNT_CREATED",
        ipAddress,
        device,
        metadata: {
            provider: "GOOGLE",
            email,
            loginMethod: "oauth",
        },
    });

    await createAuditLog({
        userId: newUser.id,
        event: "OAUTH_LINKED",
        ipAddress,
        device,
        metadata: {
            provider: "GOOGLE",
            email,
        },
    });

    await createAuditLog({
        userId: newUser.id,
        event: "OAUTH_LOGIN",
        ipAddress,
        device,
        metadata: {
            provider: "GOOGLE",
        },
    });

    const r = await redis.del(`sessions:${newUser.id}`);
    console.log("redis key deleted", r, newUser);
    // although for the new user, currently user dont have mfa but for the consistency use this
    if (newUser.mfaEnabled) {

    const tempToken =
        await createTempMfaToken(
            newUser.id
        );

    return NextResponse.redirect(
        `${process.env.APP_URL}/oauth-mfa?tempToken=${tempToken}`
    );
}

return createUserSession({
    user: newUser,
    request,
    response
});
}