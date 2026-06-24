import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/response";
import { authenticate } from "@/modules/auth/middleware/auth.middleware";
import { handleApiError } from "@/lib/errors/handle-api-error";
import { mfaDisableService } from "@/modules/auth/services/mfaService/mfa-disable.service";

export async function POST(req: NextRequest) {
    try {
        const {user} = await authenticate(req);

        const body = await req.json();

        await mfaDisableService(
            user.id,
            body.code
        );

        return successResponse(
            "MFA disabled successfully",
            null,
            200
        );

    } catch (error) {
        return handleApiError(error)
    }
}