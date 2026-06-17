// /api/auth/logout/route.ts

import { COOKIE_NAMES } from "@/constants";
import { handleApiError } from "@/lib/errors/handle-api-error";
import { getDeviceInfo } from "@/modules/auth/helpers/device-info";
import { getIpAddress } from "@/modules/auth/helpers/ip-address";
import { logoutCurrentDeviceService } from "@/modules/auth/services/authService/logout.service";
import { clearAuthCookies } from "@/utils/cookies";
import { successResponse } from "@/utils/response";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();

        const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

        const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

        // already logged out
        if (!accessToken ||!refreshToken) {
            const response = successResponse("Already logged out", null, 200);

            clearAuthCookies(response);

            return response;
        }

        const requestInfo = {
            ipAddress:
                getIpAddress(
                    request
                ),
            device:
                getDeviceInfo(
                    request
                ).device,
        };

        await logoutCurrentDeviceService(
            accessToken,
            refreshToken,
            requestInfo
        );

        const response =successResponse("Logged out successfully");

        clearAuthCookies(response);

        return response;
    } catch (err) {
        return handleApiError(err);
    }
}