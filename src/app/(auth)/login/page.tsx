import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

function page() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">
                        Sign In
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <LoginForm />
                </CardContent>
            </Card>
        </div>
    )
}

export default page
