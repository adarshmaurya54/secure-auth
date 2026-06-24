'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { showApiError } from "@/lib/errors/toast-error";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function MfaVerifyPage() {
    const router = useRouter();
    const {setUser} = useAuth();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [tempToken, setTempToken] = useState("");

    useEffect(() => {
        const token = sessionStorage.getItem("mfaTempToken");

        if (!token) {
            router.replace("/login");
            return;
        }

        setTempToken(token);
    }, [router]);

    const handleVerify = async () => {
        if (code.length !== 6) {
            return toast.error("Enter a valid 6 digit code");
        }

        setLoading(true);

        try {
            const { data } = await axios.post(
                "/api/auth/mfa/verify",
                {
                    tempToken,
                    code
                }
            );

            sessionStorage.removeItem("mfaTempToken");

            toast.success(data.message || "Login successful");
            setUser(data.data.user);

            router.replace("/dashboard");
        } catch (error) {
            showApiError(error)

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>
                        Two-Factor Authentication
                    </CardTitle>

                    <CardDescription>
                        Enter the 6-digit code from your authenticator app.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Input
                        placeholder="000000"
                        maxLength={6}
                        value={code}
                        onChange={(e) =>
                            setCode(
                                e.target.value.replace(/\D/g, "")
                            )
                        }
                        className="text-center text-lg tracking-[0.5em]"
                    />

                    <Button
                        className="w-full"
                        onClick={handleVerify}
                        disabled={
                            loading ||
                            code.length !== 6
                        }
                    >
                        {loading
                            ? "Verifying..."
                            : "Verify"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}