"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MonitorX } from "lucide-react";
import { SessionCard } from "./SessionCard";
import type { Session } from "@/types/session.types"

type SessionListProps = {
  sessions: Session[];
  revokingSessionIds: string[];
  onRevoke: (id: string) => void;
};

export function SessionList({ sessions, revokingSessionIds, onRevoke }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-muted-foreground">
          <MonitorX className="h-8 w-8 opacity-40" />
          <p className="text-sm">No active sessions found.</p>
        </CardContent>
      </Card>
    );
  }

  // current session always on top
  const sorted = [...sessions].sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));

  return (
    <div className="space-y-3">
      {sorted.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          isRevoking={revokingSessionIds.includes(session.id)}
          onRevoke={onRevoke}
        />
      ))}
    </div>
  );
}