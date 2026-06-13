"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Monitor,
  Settings,
  Shield,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const {
    user,
    loading,
    logout,
  } = useAuth();

  const router = useRouter();
  const pathname =
    usePathname();

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const initials =
    user.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const pageTitle =
    pathname ===
    "/dashboard"
      ? "Dashboard"
      : pathname ===
          "/settings"
        ? "Settings"
        : pathname ===
            "/settings/sessions"
          ? "Sessions"
          : "Dashboard";

  return (
    <div className="min-h-screen bg-background">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Left */}
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {pageTitle}
            </h1>
          </div>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
            >
              <button className="group flex items-center gap-3 rounded-full p-1 transition hover:bg-muted/70">
                <Avatar className="h-9 w-9 border">
                  <AvatarFallback className="bg-muted text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden text-left md:block">
                  <p className="max-w-[150px] truncate text-sm font-medium leading-none">
                    {user.name}
                  </p>

                  <p className="max-w-[160px] truncate pt-1 text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>

                <ChevronDown className="hidden h-4 w-4 text-muted-foreground transition group-hover:text-foreground md:block" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-[320px] rounded-3xl border bg-background p-2 shadow-2xl"
            >
              {/* USER SECTION */}
              <div className="rounded-2xl px-3 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="text-lg font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">
                      {user.name}
                    </h3>

                    <p className="truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>

                    {user.isVerified && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verified
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* MENU */}
              <DropdownMenuGroup className="space-y-1 p-1">
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard"
                    className={`flex h-11 cursor-pointer items-center rounded-2xl px-3 text-sm font-medium transition ${
                      pathname ===
                      "/dashboard"
                        ? "bg-muted"
                        : "hover:bg-muted"
                    }`}
                  >
                    <LayoutDashboard className="mr-3 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className={`flex h-11 cursor-pointer items-center rounded-2xl px-3 text-sm font-medium transition ${
                      pathname ===
                      "/settings"
                        ? "bg-muted"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/settings/sessions"
                    className={`flex h-11 cursor-pointer items-center rounded-2xl px-3 text-sm font-medium transition ${
                      pathname ===
                      "/settings/sessions"
                        ? "bg-muted"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Monitor className="mr-3 h-4 w-4" />
                    Sessions
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex h-11 cursor-pointer items-center rounded-2xl px-3 text-sm font-medium transition hover:bg-muted">
                  <Shield className="mr-3 h-4 w-4" />
                  Security
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* LOGOUT */}
              <div className="p-1">
                <Button
                  variant="ghost"
                  onClick={
                    handleLogout
                  }
                  disabled={
                    isLoggingOut
                  }
                  className="h-11 w-full justify-start rounded-2xl px-3 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                >
                  <LogOut className="mr-3 h-4 w-4" />

                  {isLoggingOut
                    ? "Logging out..."
                    : "Logout"}
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}