import { handleApiError } from "@/lib/errors/handle-api-error";
import { authenticate } from "@/modules/auth/middleware/auth.middleware";
import { mfaEnableService } from "@/modules/auth/services/mfaService/mfa-enable.service";
import { successResponse } from "@/utils/response";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const {user} = await authenticate(req);
        const body = await req.json();
        const result = await mfaEnableService(user.id, body.code);
        return successResponse("MFA enabled successfully", result, 200);
    } catch (error) {
        return handleApiError(error)
    }
}