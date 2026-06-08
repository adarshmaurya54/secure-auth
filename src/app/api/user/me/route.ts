import { authenticate } from "@/modules/auth/middleware/auth.middleware";
import { errorResponse, successResponse } from "@/utils/response";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const user = await authenticate(req);

        return successResponse("Profile fetched", user, 200)

    } catch (error) {
        return errorResponse(error instanceof Error ? error.message : "Something went wrong", null, 500)
    }
}