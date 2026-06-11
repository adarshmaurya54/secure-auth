'use client'
import { showApiError } from '@/lib/errors/toast-error'
import { resetPasswordSchema, ResetPasswordValues } from '@/schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { PasswordInput } from './PasswordInput'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { toast } from 'sonner'
import { PasswordStrengthBar } from './PasswordStrengthBar'

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") as string;
    const form = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onBlur",
        values: {
            password: "",
            confirmPassword: ""
        }
    })
    const router = useRouter();
    const password = form.watch("password");
    const onSubmit = async (values: ResetPasswordValues) => {
        try {
            const res = await authService.resetPassword(token, values.password)
            toast.success(res.message)
            router.replace("/login");
        } catch (error) {
            showApiError(error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
                {/* Password */}
                <FormField
                    control={
                        form.control
                    }
                    name="password"
                    render={({
                        field,
                    }) => (
                        <FormItem>
                            <FormLabel>
                                Password
                            </FormLabel>

                            <FormControl>
                                <PasswordInput
                                    placeholder="Enter your password"
                                    {...field}
                                />
                            </FormControl>

                            <PasswordStrengthBar
                                password={password}
                            />

                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* confirm password */}
                <FormField
                    control={
                        form.control
                    }
                    name="confirmPassword"
                    render={({
                        field,
                    }) => (
                        <FormItem>
                            <FormLabel>
                                Confirm Password
                            </FormLabel>

                            <FormControl>
                                <PasswordInput
                                    placeholder="Enter your confirm password"
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full"
                    disabled={
                        form.formState
                            .isSubmitting
                    }
                >
                    {form.formState
                        .isSubmitting
                        ? <Loader2 className='animate-spin' />
                        : "Submit"}
                </Button>
            </form>
        </Form>
    )
}

export default ResetPasswordForm
