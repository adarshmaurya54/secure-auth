import { logoutFromCurrentDeviceSevice } from "@/modules/auth/services/auth.services";
export async function GET () {
    return logoutFromCurrentDeviceSevice()
}