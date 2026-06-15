import { User } from "@/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken, generateRefreshToken } from "./jwt";
import { createSession } from "../repository/auth.repository";
import { hashToken } from "./hash-token";
import { getDeviceInfo } from "./device-info";
import { getIpAddress } from "./ip-address";
import { setAuthCookies } from "@/utils/cookies";

type CreateUserSessionParams = {
    user: User;
    request: NextRequest;
    response?: NextResponse;
};

export async function createUserSession({
    user,
    request,
    response,
}: CreateUserSessionParams) {

    const { token: refreshToken } =
        generateRefreshToken(
            user.id
        );
    const refreshTokenHash = hashToken(refreshToken);
    const deviceInfo = getDeviceInfo(request);
    const ipAddress = getIpAddress(request);

    const session = await createSession({
        userId: user.id,
        refreshTokenHash,

        ipAddress,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,

        expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        )
    })

    const accessToken = generateAccessToken(user.id, session.id, user.role);

    // -----------------------------------
    // Create Response
    // -----------------------------------

    const finalResponse =
        response ??
        NextResponse.json(
            {
                success: true,

                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                },
            },
            { status: 200 }
        );


    // -----------------------------------
    // Set Cookies
    // -----------------------------------

    setAuthCookies(
        finalResponse,
        accessToken,
        refreshToken
    );


    return finalResponse;
}