import { handleApiError } from "@/lib/errors/handle-api-error";
import { verifyEmailService } from "@/modules/auth/services/authService/verifyEmail.service";
import { errorResponse, successResponse } from "@/utils/response";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const {email, code} = await request.json();

        if(!code) {
            return errorResponse("Verification code is required", null, 400);
        }

        const result = await verifyEmailService(email, code);

        return successResponse(result.message, null, 200);
    }catch (error) {
        return handleApiError(error);
    }
}