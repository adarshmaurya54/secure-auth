import { resetPasswordService } from "@/modules/auth/services/auth.services";
import { errorResponse } from "@/utils/response";
import { NextRequest, } from "next/server";

export async function POST(req: NextRequest) {
    try {
        
        const {token, newPassword} = await req.json();
        if(!token || !newPassword){
            return errorResponse("Please provide both token and newPassword", null, 404);
        }
        
        const response = await resetPasswordService(token, newPassword, {
            ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
            device: req.headers.get("user-agent") ?? "unknown",
        })

        return response;

    } catch (error) {
        return errorResponse(error instanceof Error ? error.message : "Something went wrong", null, 500)
    }
}