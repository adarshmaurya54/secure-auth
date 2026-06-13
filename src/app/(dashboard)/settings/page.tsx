"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Mail,
  Monitor,
  Shield,
  User2,
  XCircle,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const {
    user,
    loading,
  } = useAuth();

  if (loading || !user) {
    return null;
  }

  const initials =
    user.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Account Settings
        </h1>

        <p className="mt-1 text-muted-foreground">
          Manage your account,
          security, and active
          sessions.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* LEFT SIDEBAR */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="overflow-hidden rounded-3xl border shadow-sm">
            <div className="h-24 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />

            <CardContent className="-mt-10 flex flex-col items-center px-6 pb-6 text-center">
              <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
                <AvatarFallback className="text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <h2 className="mt-4 text-xl font-semibold">
                {user.name}
              </h2>

              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Badge
                  variant="secondary"
                  className="rounded-full px-3"
                >
                  {user.role ||
                    "User"}
                </Badge>

                <Badge
                  variant={
                    user.isVerified
                      ? "default"
                      : "secondary"
                  }
                  className="rounded-full px-3"
                >
                  {user.isVerified
                    ? "Verified"
                    : "Unverified"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-3xl">
            <CardContent className="p-2">
              <Link
                href="/settings/sessions"
              >
                <button className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2">
                      <Monitor className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                      <p className="font-medium">
                        Active Sessions
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Manage devices
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </Link>

              <Separator />

              <button className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition hover:bg-muted">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <p className="font-medium">
                      Security
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Password & auth
                    </p>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT CONTENT */}
        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>
                Personal Information
              </CardTitle>

              <CardDescription>
                Your account details.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border bg-muted/30 p-5">
                  <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                    <User2 className="h-4 w-4" />
                    <span className="text-sm">
                      Full Name
                    </span>
                  </div>

                  <p className="font-medium">
                    {user.name}
                  </p>
                </div>

                <div className="rounded-2xl border bg-muted/30 p-5">
                  <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">
                      Email
                    </span>
                  </div>

                  <p className="font-medium break-all">
                    {user.email}
                  </p>
                </div>

                <div className="rounded-2xl border bg-muted/30 p-5">
                  <div className="mb-3 text-sm text-muted-foreground">
                    Role
                  </div>

                  <p className="font-medium capitalize">
                    {user.role ||
                      "User"}
                  </p>
                </div>

                <div className="rounded-2xl border bg-muted/30 p-5">
                  <div className="mb-3 text-sm text-muted-foreground">
                    Email Status
                  </div>

                  <div className="flex items-center gap-2 font-medium">
                    {user.isVerified ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        Not Verified
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>
                Security
              </CardTitle>

              <CardDescription>
                Manage password and
                account protection.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-medium">
                    Password
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Change your
                    account password.
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="rounded-xl"
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}