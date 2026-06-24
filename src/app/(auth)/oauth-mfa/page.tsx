'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthMfaPage() {
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const tempToken = params.get("tempToken");

        if (!tempToken) {
            router.replace("/login");
            return;
        }

        sessionStorage.setItem(
            "mfaTempToken",
            tempToken
        );

        router.replace("/mfa/verify");
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            Redirecting...
        </div>
    );
}