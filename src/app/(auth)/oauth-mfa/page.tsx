'use client'

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthMfaPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const tempToken = searchParams.get("tempToken");

        if (!tempToken) {
            router.replace("/login");
            return;
        }

        sessionStorage.setItem(
            "mfaTempToken",
            tempToken
        );

        router.replace("/mfa/verify");
    }, [router, searchParams]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            Redirecting...
        </div>
    );
}