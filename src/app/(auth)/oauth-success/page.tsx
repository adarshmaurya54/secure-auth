"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    // Small delay lets browser commit the cookies
    // before middleware checks them
    const timer = setTimeout(() => {
      router.replace(callbackUrl);
    }, 500);

    return () => clearTimeout(timer);
  }, [callbackUrl, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Signing you in...</p>
    </div>
  );
}