import { logoutFromCurrentOrAllDevicesService } from "@/modules/auth/services/auth.services";
import { NextRequest } from "next/server";
export async function POST (req: NextRequest) {
    return await logoutFromCurrentOrAllDevicesService("ALL", {
                ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
                device: req.headers.get("user-agent") ?? "unknown",
            })
}