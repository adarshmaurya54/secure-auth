"use client";

import {
  BadgeCheck,
  Mail,
  Shield,
  User2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, loading } =
    useAuth();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56" />

        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-20 w-20 rounded-full" />

            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-5 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back,
          {" "}
          {user?.name}
        </h1>

        <p className="text-muted-foreground">
          Here’s your account
          overview.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-semibold">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <CardTitle className="text-xl">
              {user?.name}
            </CardTitle>

            <CardDescription>
              {user?.email}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <User2 className="h-4 w-4" />
                Name
              </div>

              <p className="font-medium">
                {user?.name}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email
              </div>

              <p className="font-medium break-all">
                {user?.email}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Role
              </div>

              <Badge variant="secondary">
                {user?.role}
              </Badge>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="h-4 w-4" />
                Verification
              </div>

              <Badge
                variant={
                  user?.isVerified
                    ? "default"
                    : "destructive"
                }
              >
                {user?.isVerified
                  ? "Verified"
                  : "Not Verified"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
