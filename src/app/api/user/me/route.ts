import { handleApiError } from "@/lib/errors/handle-api-error";
import { authenticate } from "@/modules/auth/middleware/auth.middleware";
import { errorResponse, successResponse } from "@/utils/response";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const auth = await authenticate(req);

        return successResponse("Profile fetched", auth.user, 200)

    } catch (error) {
        return handleApiError(
            error
        );
    }
}