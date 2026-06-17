import { Suspense } from "react";
import { OAuthSuccess } from "@/components/auth/OAuthSuccess";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p>Signing you in...</p>
      </div>
    }>
      <OAuthSuccess />
    </Suspense>
  );
}