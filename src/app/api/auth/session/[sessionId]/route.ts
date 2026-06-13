import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/modules/auth/middleware/auth.middleware";
import { getDeviceInfo } from "@/modules/auth/helpers/device-info";
import { getIpAddress } from "@/modules/auth/helpers/ip-address";
import { handleApiError } from "@/lib/errors/handle-api-error";
import { logoutFromSpecificDeviceService } from "@/modules/auth/services/authService/logout.service";

type Params = Promise<{
    sessionId: string;
}>;

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
    try {
        const auth = await authenticate(request);

        const { sessionId } = await params;

        const deviceInfo = getDeviceInfo(request);

        const requestInfo = {
            ipAddress: getIpAddress(request),
            device: deviceInfo.device,
        };

        const result = await logoutFromSpecificDeviceService(
            sessionId,
            auth.sessionId,
            auth.user.id,
            requestInfo
        );

        return NextResponse.json({
            success: true,
            message: result.message,
        }, { status: 200 });

    } catch (err) {
        return handleApiError(err);
    }
}