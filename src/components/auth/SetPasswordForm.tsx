'use client'

import { changePasswordSchema, ChangePasswordValues, setPasswordSchema, SetPasswordValues } from '@/schemas/auth.schema'
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

function SetPasswordForm({onClose}: {
  onClose: () => void;
}) {
    const form = useForm<SetPasswordValues>({
        resolver: zodResolver(setPasswordSchema),
        mode: "onBlur",
        values: {
            password: "",
            confirmPassword: ""
        }
    })

    const password = form.watch("password");

    const onSubmit = async (values: SetPasswordValues) => {
        try {
            const res = await authService.setPassword({ password: values.password, confirmPassword: values.confirmPassword });
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
                        : "Set Password"}
                </Button>
            </form>
        </Form>
    )
}

export default SetPasswordForm
