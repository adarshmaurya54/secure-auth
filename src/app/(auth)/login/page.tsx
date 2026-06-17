import { LoginForm } from "@/components/auth/LoginForm";
import LoginSkeleton from "@/components/login-skeleton";
import { GoogleLoginButton } from "@/components/shared/GoogleLoginButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/page-loader";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Sign In</CardTitle>
          <p className="text-center text-sm text-muted-foreground mt-1">
            Welcome back! Please enter your details.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Google OAuth — prominent at top */}
          <Suspense fallback={<PageLoader />}>
            <GoogleLoginButton />
          </Suspense>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>

          {/* Credentials form */}
          <Suspense fallback={<LoginSkeleton />}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}