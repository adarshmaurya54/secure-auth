import { handleApiError } from "@/lib/errors/handle-api-error";
import { refreshTokenRotationService } from "@/modules/auth/services/auth.services";
import { clearAuthCookies, setAuthCookies } from "@/utils/cookies";
import { errorResponse } from "@/utils/response";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try{
        const {newAccessToken, newRefreshToken} = await refreshTokenRotationService()

        const response = NextResponse.json({
            success: true,
            message: "Token refreshed"
        }, {status: 200})

        setAuthCookies(response, newAccessToken, newRefreshToken);

        return response;
    }catch(error){
        return handleApiError(error)
    }
}