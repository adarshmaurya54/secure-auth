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

    return createUserSession({
        user: newUser,
        request,
        response
    });
}