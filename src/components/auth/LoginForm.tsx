'use client'
import { useAuth } from "@/context/AuthContext";
import { LoginFormValues, loginSchema } from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import Link from "next/link";
import { Button } from "../ui/button";
import { PasswordInput } from "./PasswordInput";
import { showApiError } from "@/lib/errors/toast-error";

export function LoginForm() {
    const router = useRouter();
    const searchParam = useSearchParams();

    const callbackUrl = searchParam.get("callbackUrl")
    const { login } = useAuth();
    const [serverError, setServerError] = useState('');

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur',
        values: {
            email: '',
            password: ''
        }
    })

    const onSubmit = async (values: LoginFormValues) => {
        try {
            setServerError('');
            await login(values.email, values.password);
            router.replace(callbackUrl ?? "/dashboard");
        } catch (err) {
            showApiError(
                err,
                "Invalid email or password"
            );
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <FormField
                    control={
                        form.control
                    }
                    name="email"
                    render={({
                        field,
                    }) => (
                        <FormItem>
                            <FormLabel>
                                Email
                            </FormLabel>

                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                            <div className="flex items-center justify-between">
                                <FormLabel>
                                    Password
                                </FormLabel>

                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Forgot
                                    password?
                                </Link>
                            </div>

                            <FormControl>
                                <PasswordInput
                                    placeholder="Enter password"
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
                        ? "Signing in..."
                        : "Sign In"}
                </Button>
                <p className="text-center text-sm">
                    Don't have an
                    account?{" "}
                    <Link
                        href="/register"
                        className="font-medium text-blue-600 hover:underline"
                    >
                        register
                    </Link>
                </p>
            </form>
        </Form>
    )
}