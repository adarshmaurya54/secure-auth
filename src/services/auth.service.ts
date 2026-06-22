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
    async forgotPassword(email: string) {
        const { data } = await api.post("/auth/forgot-password", { email });
        return data;
    },
    async resetPassword(token: string, newPassword: string) {
        const { data } = await api.post("/auth/reset-password", { token, newPassword });
        return data;
    },
    async verifyEmail(data: { email: string; code: string }) {
        const res = await api.post("/auth/verify-email", data);
        return res.data;
    },
    async resendVerification(email: string) {
        const {data} = await api.post("/auth/resend-verification", {email});
        return data;
    },
    async changePassword(data: {currentPassword: string, newPassword: string}) {
        const res = await api.post("/auth/change-password", data)
        return res.data
    },
    async setPassword(data: {password: string, confirmPassword: string}) {
        const res = await api.post("/auth/set-password", data)
        return res.data
    }
};