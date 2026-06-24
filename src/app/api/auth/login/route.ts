import { getDeviceInfo } from "@/modules/auth/helpers/device-info";
import { getIpAddress } from "@/modules/auth/helpers/ip-address";
import { loginRateLimiter } from "@/modules/auth/helpers/rate-limit";
import { rateLimit } from "@/modules/auth/helpers/rate-limit-helper";
import { loginService } from "@/modules/auth/services/authService/login.service";
import { setAuthCookies } from "@/utils/cookies";
import { errorResponse, successResponse } from "@/utils/response";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest){
    try{
        const deviceInfo = getDeviceInfo(req);
        const ipAddress = getIpAddress(req);

        await rateLimit(loginRateLimiter, ipAddress);
        
        const body = await req.json();
        const result = await loginService(
            body,
            {
                ipAddress,
                device: deviceInfo.device,
                browser: deviceInfo.browser,
                os: deviceInfo.os
            }
        )
        if(result.mfaRequired) {
            return successResponse("MFA required", {mfaRequired: true, tempToken: result.tempToken}, 200)
        }

        const response = successResponse("Login successfull", {user: result.user}, 200)

        setAuthCookies(
            response,
            result.accessToken!,
            result.refreshToken!
        )

        return response;
    }catch(error){
        return errorResponse(error instanceof Error ? error.message : "Something went wrong", null, 500)
    }
}