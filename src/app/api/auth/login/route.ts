import { loginRateLimiter } from "@/modules/auth/helpers/rate-limit";
import { rateLimit } from "@/modules/auth/helpers/rate-limit-helper";
import { loginService } from "@/modules/auth/services/authService/login.service";
import { setAuthCookies } from "@/utils/cookies";
import { errorResponse, successResponse } from "@/utils/response";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest){
    try{
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";

        await rateLimit(loginRateLimiter, ip);
        console.log("POST login API CALLED")
        const body = await req.json();
        const result = await loginService(
            body,
            {
                ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
                device: req.headers.get("user-agent") ?? "unknown",
                browser: req.headers.get("user-agent") ?? "unknown"
            }
        )

        const response = successResponse("Login successfull", {user: result.user}, 200)

        setAuthCookies(
            response,
            result.accessToken,
            result.refreshToken
        )

        return response;
    }catch(error){
        return errorResponse(error instanceof Error ? error.message : "Something went wrong", null, 500)
    }
}