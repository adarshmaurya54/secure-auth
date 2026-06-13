"use client";

import {
  Laptop,
  Smartphone,
  Monitor,
  Shield,
  Loader2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { useSession } from "@/hooks/useSession";
import { useState } from "react";
import { toast } from "sonner";
import { sessionService } from "@/services/session.service";
import { showApiError } from "@/lib/errors/toast-error";
import { useRouter } from "next/navigation";

export default function SessionsPage() {
  const { sessions, loading, setSessions } = useSession();
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const router = useRouter();

  const handleLogoutAllDevices = async () => {
    try {
      setIsRevokingAll(true);

      await sessionService.revokeAllSessions();

      toast.success(
        "Logged out from all devices"
      );
      router.replace('/login');
      router.refresh();
    } catch (error) {
      showApiError(error);
    } finally {
      setIsRevokingAll(false);
    }
  };

  const handleRemoveSession = async (
    sessionId: string
  ) => {
    try {
      setRevokingSessionId(sessionId);

      await sessionService.revokeSession(
        sessionId
      );

      toast.success(
        "Device removed successfully"
      );

      // if current device removed
      setSessions((prev) =>
        prev.filter(
          (session) =>
            session.id !== sessionId
        ))
    } catch (error) {
      showApiError(error);
    } finally {
      setRevokingSessionId(null);
    }
  };

  if (loading) {
    return <p>Loading sessions...</p>;
  }

  const getDeviceIcon = (
    device: string
  ) => {
    switch (device?.toLowerCase()) {
      case "mobile":
        return Smartphone;

      case "desktop":
        return Laptop;

      default:
        return Monitor;
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Active Sessions
          </h1>

          <p className="text-muted-foreground">
            Manage devices logged into your account.
          </p>
        </div>

        <Button
          variant="destructive"
          onClick={handleLogoutAllDevices}
          disabled={isRevokingAll}
        >
          {isRevokingAll ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging out...
            </>
          ) : (
            "Logout All Devices"
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-10 text-muted-foreground">
              No active sessions found.
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => {
            const Icon = getDeviceIcon(
              session.device
            );

            return (
              <Card key={session.id}>
                <CardContent className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-primary/10 p-3">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">
                          {session.browser ??
                            "Unknown Browser"}{" "}
                          on{" "}
                          {session.deviceName}
                        </h3>

                        {session.isCurrent && (
                          <Badge>
                            Current Device
                          </Badge>
                        )}
                      </div>

                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p>
                          OS:{" "}
                          {session.os ??
                            "Unknown OS"}
                        </p>

                        <p>
                          IP Address:{" "}
                          {session.ipAddress ??
                            "Unknown"}
                        </p>

                        <p>
                          Last Active:{" "}
                          {session.lastActive}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleRemoveSession(session.id)
                      }
                      disabled={
                        revokingSessionId === session.id
                      }
                    >
                      {revokingSessionId ===
                        session.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        "Remove"
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-5">
          <Shield className="h-6 w-6 text-primary" />

          <div>
            <h3 className="font-medium">
              Security Tip
            </h3>

            <p className="text-sm text-muted-foreground">
              If you notice an unknown device,
              remove it immediately.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}