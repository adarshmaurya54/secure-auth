import { handleApiError } from "@/lib/errors/handle-api-error";
import { authenticate } from "@/modules/auth/middleware/auth.middleware";
import { getUserSessionsService } from "@/modules/auth/services/authService/session.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const auth = await authenticate(req);
        const sessions =
            await getUserSessionsService(
                auth.user.id,
                auth.sessionId
            );
        return NextResponse.json(
            {
                success: true,
                sessions,
            },
            { status: 200 }
        );
    } catch (error) {
        return handleApiError(error)
    }
}