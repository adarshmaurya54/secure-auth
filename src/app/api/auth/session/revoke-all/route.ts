import { COOKIE_NAMES } from "@/constants";
import { handleApiError } from "@/lib/errors/handle-api-error";
import { verifyAccessToken } from "@/modules/auth/helpers/jwt";
import { logoutAllDevicesService } from "@/modules/auth/services/authService/logout.service";
import { clearAuthCookies } from "@/utils/cookies";
import { successResponse } from "@/utils/response";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies();

        const accessToken = cookieStore.get(
                COOKIE_NAMES.ACCESS_TOKEN
            )?.value;

        if (!accessToken) {
            return successResponse("Already logged out", null, 200)
        }

        const payload = verifyAccessToken(
                accessToken
            );

        await logoutAllDevicesService(payload.sub,accessToken);

        const response = successResponse("Logged out from all devices", null, 200)

        clearAuthCookies(response);

        return response;
    } catch (err) {
        return handleApiError(err);
    }
}