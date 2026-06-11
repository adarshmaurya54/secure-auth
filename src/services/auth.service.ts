import { api } from "@/lib/api";
import type { LoginFormValues, RegisterFormValues } from "@/schemas/auth.schema"
import type { User } from "@/types/auth.types";
export const authService = {
    async register(data: RegisterFormValues) {
        const res = await api.post("/auth/register", data);
        return res.data;
    },
    async login(data: LoginFormValues): Promise<User> {
        const res = await api.post("/auth/login", data);
        return res.data.data.user;
    },
    async logout() {
        await api.post("/auth/logout");
    },
    async getMe(): Promise<User> {
        const res = await api.get("/user/me");
        return res.data.data;
    },
    // async forgotPassword(email: string) {
    //     await api.post("/auth/forgot-password", { email });
    // },
    // async resetPassword(token: string, password: string) {
    //     await api.post("/auth/reset-password", { token, password });
    // },
    // async resendVerification() {
    //     await api.post("/auth/resend-verification");
    // },
};