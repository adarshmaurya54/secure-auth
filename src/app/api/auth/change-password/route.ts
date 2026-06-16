import { handleApiError } from "@/lib/errors/handle-api-error";
import { authenticate } from "@/modules/auth/middleware/auth.middleware";
import { changePasswordService } from "@/modules/auth/services/authService/change-password.service";
import { successResponse } from "@/utils/response";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticate(request);
        const {currentPassword, newPassword} = await request.json();
        await changePasswordService(
            auth.user.email,
            auth.sessionId,
            currentPassword,
            newPassword
        )
        return successResponse("Password changed successfully", null, 200);
    } catch (error) {
        return handleApiError(error)
    }
}