import { resendVerificationEmailService } from "@/modules/auth/services/authService/resendVerificationEmail.service";
import { emailSchema } from "@/modules/auth/validators/auth.validators";
import { errorResponse } from "@/utils/response";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Validate input
        const validatedData = emailSchema.safeParse(body);

        if (!validatedData.success) {
            return errorResponse(validatedData.error.issues[0].message, null, 400);
        }

        const { email } = validatedData.data;

        const response = await resendVerificationEmailService(email, {
            ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
            device: req.headers.get("user-agent") ?? "unknown",
        })

        return response;
    } catch (error) {
        return errorResponse(error instanceof Error ? error.message : "Something went wrong", null, 500)
    }
}