import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { Card, CardContent } from '@/components/ui/card'
import React from 'react'

function ResetPasswordPage() {
    return (
        <Card className="w-full">
            <CardContent className="pt-6">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold">
                        Reset Password
                    </h1>

                    <p className="text-muted-foreground mt-1">
                        Reset your password
                    </p>
                </div>
                <ResetPasswordForm />
            </CardContent>
        </Card>
    )
}

export default ResetPasswordPage
