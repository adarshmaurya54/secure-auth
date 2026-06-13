// there is a problem we have to solve this later, implement code based email verification
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmailVerificationForm from "@/components/auth/EmailVerificationForm";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") as string;

  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to
          </p>

          <p className="font-medium">{email}</p>
        </div>
        <div className="flex items-center justify-center">
          <EmailVerificationForm email={email} />
        </div>
      </CardContent>
    </Card>
  );
}