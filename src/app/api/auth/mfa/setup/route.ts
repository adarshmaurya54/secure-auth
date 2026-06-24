import { handleApiError } from "@/lib/errors/handle-api-error";
import { getDeviceInfo } from "@/modules/auth/helpers/device-info";
import { getIpAddress } from "@/modules/auth/helpers/ip-address";
import { authenticate } from "@/modules/auth/middleware/auth.middleware";
import { mfaSetupService } from "@/modules/auth/services/mfaService/mfa-setup.service";
import { errorResponse, successResponse } from "@/utils/response";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const {user} = await authenticate(req);
        const result = await mfaSetupService(user.id);
        return successResponse("MFA setup initiated", result, 200);
    } catch (error) {
        return handleApiError(error);
    }
}