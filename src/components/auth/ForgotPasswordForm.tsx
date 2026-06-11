'use client'

import { forgotPasswordSchema, ForgotPasswordValues } from '@/schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'
import { showApiError } from '@/lib/errors/toast-error'

function ForgotPasswordForm() {
    const form = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: "onBlur",
        values: {
            email: ""
        }
    })

    const onSubmit = async (values: ForgotPasswordValues) => {
        try {
            const res = await authService.forgotPassword(values.email);
            toast.info(res.message)
        } catch (err) {
            showApiError(
                err,
            );
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
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

export default ForgotPasswordForm
