"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function OAuthSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  useEffect(() => {
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