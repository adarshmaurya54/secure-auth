"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Mail,
  Monitor,
  User2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import { Separator } from "@/components/ui/separator";

function ChangePasswordModel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const handleClose = () => {
    onClose();
  }
  return <Dialog open={open} onOpenChange={handleClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Change password</DialogTitle>
        <DialogDescription>
          All other devices will be signed out after this change.
        </DialogDescription>
      </DialogHeader>
      <Separator/>
      <ChangePasswordForm onClose={onClose} />
    </DialogContent>
  </Dialog>
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showChangePassword, setShowChangePassword] = useState(false);

  if (loading || !user) return null;

  const initials =
    user.name
      ?.split(" ")
      .map((word: string) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const handleVerifyEmail = () => {
    router.push(
      `/verify-email?email=${encodeURIComponent(user.email)}`
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Account Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account, security, and active sessions.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* ── LEFT SIDEBAR ── */}
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

              <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Badge variant="secondary" className="rounded-full px-3">
                  {user.role || "User"}
                </Badge>

                <Badge
                  variant={user.isVerified ? "default" : "destructive"}
                  className="rounded-full px-3"
                >
                  {user.isVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Nav */}
          <Card className="rounded-3xl">
            <CardContent className="p-2">
              {/* Active Sessions */}
              <Link href="/settings/sessions">
                <button className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2">
                      <Monitor className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-muted-foreground">
                        Manage devices
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </Link>

              {/* Email Verification — only show if not verified */}
              {!user.isVerified && (
                <button
                  onClick={handleVerifyEmail}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition hover:bg-destructive/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-destructive/10 p-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-destructive">
                        Email not verified
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Click to verify now
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT CONTENT ── */}
        <div className="space-y-6">
          {/* Email verification banner — shown only if not verified */}
          {!user.isVerified && (
            <div className="flex items-start gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-destructive">
                  Your email address is not verified
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Some features may be restricted until you verify{" "}
                  <span className="font-medium text-foreground">
                    {user.email}
                  </span>
                  .
                </p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="shrink-0"
                onClick={handleVerifyEmail}
              >
                Verify now
              </Button>
            </div>
          )}

          {/* Personal Information */}
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your account details.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border bg-muted/30 p-5">
                  <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                    <User2 className="h-4 w-4" />
                    <span className="text-sm">Full Name</span>
                  </div>
                  <p className="font-medium">{user.name}</p>
                </div>

                <div className="rounded-2xl border bg-muted/30 p-5">
                  <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email</span>
                  </div>
                  <p className="font-medium break-all">{user.email}</p>
                </div>

                <div className="rounded-2xl border bg-muted/30 p-5">
                  <div className="mb-3 text-sm text-muted-foreground">Role</div>
                  <p className="font-medium capitalize">
                    {user.role || "User"}
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
                      <button
                        onClick={handleVerifyEmail}
                        className="flex items-center gap-2 text-destructive underline-offset-4 hover:underline"
                      >
                        <XCircle className="h-4 w-4" />
                        Not verified — click to verify
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage password and account protection.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Change your account password.
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl" onClick={() => setShowChangePassword(true)}>
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ChangePasswordModel
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </div>
  );
}