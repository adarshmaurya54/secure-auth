import { registerRateLimiter } from "@/modules/auth/helpers/rate-limit";
import { rateLimit } from "@/modules/auth/helpers/rate-limit-helper";
import { registerService } from "@/modules/auth/services/authService/register.service";
import { errorResponse, successResponse } from "@/utils/response";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";

        //apply rate limiting based on IP address to prevent abuse of registration endpoint
        await rateLimit(registerRateLimiter, ip);

        const body = await req.json();

        const user = await registerService(body, {
            ipAddress:ip,
            device: req.headers.get("user-agent") ?? "unknown",
        });


        return successResponse('User registered successfully, please check your email to verify your account.', user, 201);

    } catch (error: any) {
        return errorResponse(error instanceof Error ? error.message : "Something went wrong", null, 500);
    }
}

export function GET(request: NextRequest) {
    const ip =
        request.headers.get(
            "x-forwarded-for"
        ) ?? "unknown";

    return NextResponse.json({ clientIp: ip });
}