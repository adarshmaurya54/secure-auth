import { authenticate } from "@/modules/auth/middleware/auth.middleware";
import { logoutFromSpecificDeviceService } from "@/modules/auth/services/auth.services";
import { errorResponse, successResponse } from "@/utils/response";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const user = await authenticate(req);
        const sessionId = req.nextUrl.pathname.split("/").pop();
        if (!sessionId) {
            return errorResponse("Session id required", null, 500);
        }

        const result = await logoutFromSpecificDeviceService(sessionId, user.id, {
                ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
                device: req.headers.get("user-agent") ?? "unknown",
            });

        return successResponse(result.message, null, 200)
    } catch (error) {
        return errorResponse(error instanceof Error ? error.message : "Something went wrong", null, 500);
    }
}