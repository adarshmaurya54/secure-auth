"use client"
import React, { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from '../ui/input'
import { PasswordInput } from './PasswordInput'
import { PasswordStrengthBar } from './PasswordStrengthBar'
import { Button } from '../ui/button'
import { useForm } from 'react-hook-form'
import { RegisterFormValues, registerSchema } from '@/schemas/auth.schema'
import { FormError } from '../shared/FormError'
import { Mail } from 'lucide-react'
import { authService } from '@/services/auth.service'
import axios from 'axios'
import { toast } from 'sonner'
import Link from 'next/link'
import { showApiError } from '@/lib/errors/toast-error'
import { useRouter } from 'next/navigation'
import { GoogleLoginButton } from '../shared/GoogleLoginButton'

const RegisterForm = () => {

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        mode: "onBlur",
        defaultValues: {
            name: '',
            email: '',
            password: "",
            confirmPassword: ""
        }
    })
    const password = form.watch("password");
    const router = useRouter();

    const onSubmit = async (values: RegisterFormValues) => {
        try {
            const res = await authService.register(values);
            if (res.success) {
                toast.success(res.message);
                router.replace(`/verify-email?email=${values.email}`)
            }
        } catch (error) {
            showApiError(
                error,
            );
        }
    }

    return (
        <Card className="w-full">
            <CardContent className="pt-6 space-y-4">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold">
                        Create an account
                    </h1>

                    <p className="text-muted-foreground mt-1">
                        Enter your details to get started
                    </p>
                </div>
                <div className="space-y-4">
                    <GoogleLoginButton />

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                or register with email
                            </span>
                        </div>
                    </div>
                </div>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-5"
                    >


                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>

                                    <FormControl>
                                        <Input
                                            placeholder="Ashish Kumar"
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>

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
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>

                                    <FormControl>
                                        <PasswordInput
                                            placeholder="Enter password"
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

                        {/* Confirm Password */}
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Confirm Password
                                    </FormLabel>

                                    <FormControl>
                                        <PasswordInput
                                            placeholder="Confirm password"
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={
                                form.formState.isSubmitting
                            }
                        >
                            {form.formState.isSubmitting
                                ? "Creating account..."
                                : "Create account"}
                        </Button>
                        <p className="text-center text-sm">
                            Don't have an
                            account?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-blue-600 hover:underline"
                            >
                                login
                            </Link>
                        </p>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default RegisterForm
