import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { Card, CardContent } from '@/components/ui/card'
import React from 'react'

function ForgotPasswordPage() {
    return (
        <Card className="w-full">
            <CardContent className="pt-6">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold">
                        Forgot Password
                    </h1>

                    <p className="text-muted-foreground mt-1">
                        Enter your email to get started
                    </p>
                </div>
                <ForgotPasswordForm />
            </CardContent>
        </Card>
    )
}

export default ForgotPasswordPage
