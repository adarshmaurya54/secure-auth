import { handleApiError } from "@/lib/errors/handle-api-error";
import { authenticate } from "@/modules/auth/middleware/auth.middleware";
import { errorResponse, successResponse } from "@/utils/response";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        console.log("me api")
        const user = await authenticate(req);

        return successResponse("Profile fetched", user, 200)

    } catch (error) {
        return handleApiError(
            error
        );
    }
}