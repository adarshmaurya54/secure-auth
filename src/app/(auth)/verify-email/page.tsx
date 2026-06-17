// no "use client" here
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VerifyEmailContent from "@/components/auth/VerifyEmailContent";

export const dynamic = "force-dynamic";

export default function VerifyEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
            <VerifyEmailContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}