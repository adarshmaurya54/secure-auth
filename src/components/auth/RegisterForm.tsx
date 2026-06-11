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

const RegisterForm = () => {
    const [serverError, setServerError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");

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

    const onSubmit = async (values: RegisterFormValues) => {
        try {
            setServerError('');
            await authService.register(values);
            setSubmitted(true);
            setSubmittedEmail(values.email);
        } catch (error) {
            showApiError(
                error,
            );
        }
    }

    // Success UI
    if (submitted) {
        return (
            <Card className="w-full border-0 shadow-none">
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Mail className="h-8 w-8 text-muted-foreground" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold">
                                Check your inbox
                            </h2>

                            <p className="text-muted-foreground mt-2">
                                We sent a verification link to
                            </p>

                            <p className="font-medium mt-1">
                                {submittedEmail}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardContent className="pt-6">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold">
                        Create an account
                    </h1>

                    <p className="text-muted-foreground mt-1">
                        Enter your details to get started
                    </p>
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
