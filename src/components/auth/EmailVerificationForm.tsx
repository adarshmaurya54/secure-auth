'use client'

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { LoadingButton } from '../shared/LoginButton';
import { showApiError } from '@/lib/errors/toast-error';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '../ui/button';

const verifyEmailSchema = z.object({
    code: z
        .string()
        .min(6, "Verification code must be 6 digits")
        .max(6, "Verification code must be 6 digits"),
});

type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

interface EmailVerificationFormProps {
    email: string;
}
function EmailVerificationForm({ email }: EmailVerificationFormProps) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(60);

    const [isResending, setIsResending] = useState(false);
    const form = useForm<VerifyEmailFormValues>({
        resolver: zodResolver(verifyEmailSchema),
        mode: "onBlur",
        values: {
            code: ""
        }
    })
    // countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () =>
            clearInterval(timer);
    }, [timeLeft]);

    const onSubmit = async (values: VerifyEmailFormValues) => {
        try {
            const res = await authService.verifyEmail({ code: values.code, email })
            if (res.success) {
                toast.success(res.message)
                router.replace('/login')
            }
        } catch (error) {
            showApiError(error)
        }
    }

    const handleResend =
        async () => {
            try {
                setIsResending(true);

                const res = await authService.resendVerification(email);

                toast.success(
                    res.message ||
                    "Verification code resent"
                );

                // restart timer
                setTimeLeft(60);
            } catch (error) {
                showApiError(error);
            } finally {
                setIsResending(false);
            }
        };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <InputOTP
                                    maxLength={6}
                                    {...field}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <LoadingButton
                    type="submit"
                    loading={form.formState.isSubmitting}
                    className="w-full"
                >
                    Verify Email
                </LoadingButton>

                <div className="text-center text-sm">
                    {timeLeft > 0 ? (
                        <p className="text-muted-foreground">
                            Resend code in{" "}
                            <span className="font-medium">
                                {timeLeft}s
                            </span>
                        </p>
                    ) : (
                        <Button
                            type="button"
                            variant="link"
                            disabled={
                                isResending
                            }
                            onClick={
                                handleResend
                            }
                        >
                            {isResending
                                ? "Resending..."
                                : "Resend Code"}
                        </Button>
                    )}
                </div>

            </form>
        </Form>
    )
}

export default EmailVerificationForm
