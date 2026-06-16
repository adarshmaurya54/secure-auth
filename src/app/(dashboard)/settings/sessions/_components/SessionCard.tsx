"use client";

import { Laptop, Smartphone, Monitor, Loader2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {Session} from "@/types/session.types"


type SessionCardProps = {
  session: Session;
  isRevoking: boolean;
  onRevoke: (id: string) => void;
};

const getDeviceIcon = (device: string) => {
  switch (device?.toLowerCase()) {
    case "mobile":
      return Smartphone;
    case "desktop":
      return Laptop;
    default:
      return Monitor;
  }
};

export function SessionCard({ session, isRevoking, onRevoke }: SessionCardProps) {
  const Icon = getDeviceIcon(session.device);

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${
        session.isCurrent ? "border-primary/40 bg-primary/[0.02]" : ""
      }`}
    >
      <CardContent className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
        {/* Left — icon + info */}
        <div className="flex items-start gap-4">
          <div
            className={`rounded-xl p-3 ${
              session.isCurrent ? "bg-primary/15" : "bg-muted"
            }`}
          >
            <Icon
              className={`h-5 w-5 ${
                session.isCurrent ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-sm">
                {session.deviceName}
              </h3>

              {session.isCurrent && (
                <Badge className="gap-1 text-xs">
                  <ShieldCheck className="h-3 w-3" />
                  This device
                </Badge>
              )}
            </div>

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground/60">OS</span>{" "}
                {session.os ?? "Unknown"}
              </p>
              <p>
                <span className="font-medium text-foreground/60">IP</span>{" "}
                {session.ipAddress ?? "Unknown"}
              </p>
              <p>
                <span className="font-medium text-foreground/60">Last active</span>{" "}
                {session.lastActive}
              </p>
            </div>
          </div>
        </div>

        {/* Right — action */}
        {!session.isCurrent && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
            onClick={() => onRevoke(session.id)}
            disabled={isRevoking}
          >
            {isRevoking ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
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
}