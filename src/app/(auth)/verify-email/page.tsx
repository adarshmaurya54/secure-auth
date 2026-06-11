// there is a problem we have to solve this later, implement code based email verification
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }

    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  if (status === "loading") return <p>Verifying your email...</p>;
  if (status === "success") return <p>Email verified! You can now log in.</p>;
  return <p>Invalid or expired link. Request a new one.</p>;
}