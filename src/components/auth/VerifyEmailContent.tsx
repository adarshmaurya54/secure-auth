"use client";

import { useSearchParams } from "next/navigation";
import EmailVerificationForm from "./EmailVerificationForm";

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") as string;

  return (
    <>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to
        </p>
        <p className="font-medium">{email}</p>
      </div>
      <div className="flex items-center justify-center">
        <EmailVerificationForm email={email} />
      </div>
    </>
  );
}