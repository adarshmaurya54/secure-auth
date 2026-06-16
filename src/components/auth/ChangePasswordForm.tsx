'use client'

import { changePasswordSchema, ChangePasswordValues } from '@/schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'

import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'
import { showApiError } from '@/lib/errors/toast-error'
import { PasswordInput } from './PasswordInput'
import { PasswordStrengthBar } from './PasswordStrengthBar'

function ChangePasswordForm({onClose}: {
  onClose: () => void;
}) {
    const form = useForm<ChangePasswordValues>({
        resolver: zodResolver(changePasswordSchema),
        mode: "onBlur",
        values: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: ""
        }
    })

    const password = form.watch("newPassword");

    const onSubmit = async (values: ChangePasswordValues) => {
        try {
            const res = await authService.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
            toast.info(res.message)
            if(res.success){
                onClose();
            }
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
                    name="currentPassword"
                    render={({
                        field,
                    }) => (
                        <FormItem>
                            <FormLabel>
                                Current Password
                            </FormLabel>

                            <FormControl>
                                <PasswordInput
                                    placeholder="Enter your current password"
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={
                        form.control
                    }
                    name="newPassword"
                    render={({
                        field,
                    }) => (
                        <FormItem>
                            <FormLabel>
                                New Password
                            </FormLabel>

                            <FormControl>
                                <PasswordInput
                                    placeholder="Enter your new password"
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
                <FormField
                    control={
                        form.control
                    }
                    name="confirmNewPassword"
                    render={({
                        field,
                    }) => (
                        <FormItem>
                            <FormLabel>
                                Confirm New Password
                            </FormLabel>

                            <FormControl>
                                <PasswordInput
                                    placeholder="Enter your confirm new password"
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
                        : "Change Password"}
                </Button>
            </form>
        </Form>
    )
}

export default ChangePasswordForm
