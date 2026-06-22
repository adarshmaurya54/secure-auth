import { handleApiError } from "@/lib/errors/handle-api-error";
import { authenticate } from "@/modules/auth/middleware/auth.middleware";
import { setPasswordService } from "@/modules/auth/services/authService/set-password";
import { successResponse } from "@/utils/response";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticate(request);
        const {password} = await request.json();
        await setPasswordService(
            auth.user.email,
            auth.sessionId,
            password,
        )
        return successResponse("Your password set successfully", null, 200);
    } catch (error) {
        return handleApiError(error)
    }
}