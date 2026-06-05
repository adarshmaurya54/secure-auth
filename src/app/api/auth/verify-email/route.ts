import { verifyEmailService } from "@/modules/auth/services/auth.services";
import { errorResponse, successResponse } from "@/utils/response";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const token = request.nextUrl.searchParams.get("token");

        if(!token) {
            return errorResponse("Verification token is required", null, 400);
        }

        const result = await verifyEmailService(token);

        return successResponse(result.message, null, 200);
    }catch (error: any) {
        return errorResponse(error instanceof Error ? error.message : "Something went wrong", null, 500);
    }
}