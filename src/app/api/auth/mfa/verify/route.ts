import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/response";
import { setAuthCookies } from "@/utils/cookies";
import { getDeviceInfo } from "@/modules/auth/helpers/device-info";
import { getIpAddress } from "@/modules/auth/helpers/ip-address";
import { handleApiError } from "@/lib/errors/handle-api-error";
import { mfaVerifyService } from "@/modules/auth/services/mfaService/mfa-verify.service";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const result = await mfaVerifyService(
            body,
            {
                ipAddress: getIpAddress(req),
                ...getDeviceInfo(req)
            }
        );

        const response = successResponse(
            "Login successful",
            { user: result.user },
            200
        );

        setAuthCookies(
            response,
            result.accessToken,
            result.refreshToken
        );

        return response;

    } catch (error) {
       return handleApiError(error);
    }
}