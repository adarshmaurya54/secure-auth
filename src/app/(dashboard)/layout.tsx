"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout =
    async () => {
      try {
        setIsLoggingOut(true);

        await logout();

        router.replace(
          "/login"
        );
      } finally {
        setIsLoggingOut(false);
      }
    };

  return (
    <div className="min-h-screen bg-muted/30">
      <nav className="flex h-16 items-center justify-between border-b bg-background px-6">
        <h1 className="text-lg font-semibold">
          Dashboard
        </h1>

        <Button
          onClick={
            handleLogout
          }
          disabled={
            isLoggingOut
          }
        >
          {isLoggingOut
            ? "Logging out..."
            : "Logout"}
        </Button>
      </nav>

      <main className="p-6">
        {children}
      </main>
    </div>
  );
}