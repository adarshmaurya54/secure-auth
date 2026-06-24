"use client";

import { Shield, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useSession";
import { useState } from "react";
import { toast } from "sonner";
import { sessionService } from "@/services/session.service";
import { showApiError } from "@/lib/errors/toast-error";
import { useRouter } from "next/navigation";

import { SessionList } from "./_components/SessionList";
import { RevokeSessionDialog } from "./_components/RevokeSessionDialog";

// ─── Loading skeleton ────────────────────────────────────────────────────────
function SessionsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function SessionsPage() {
  const { sessions, loading, setSessions } = useSession();
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [revokingSessionIds, setRevokingSessionIds] = useState<string[]>([]);
  const router = useRouter();

  const handleLogoutAllDevices = async () => {
    try {
      setIsRevokingAll(true);
      await sessionService.revokeAllSessions();
      toast.success("Logged out from all devices");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      showApiError(error);
    } finally {
      setIsRevokingAll(false);
    }
  };

  const handleRemoveSession = async (sessionId: string) => {
    try {
      setRevokingSessionIds(prev => [...prev, sessionId]);
      await sessionService.revokeSession(sessionId);
      toast.success("Device removed");
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (error) {
      showApiError(error);
    } finally {
      setRevokingSessionIds(prev =>
        prev.filter(id => id !== sessionId)
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Active sessions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? "Loading your devices…"
              : `${sessions.length} device${sessions.length !== 1 ? "s" : ""} signed in`}
          </p>
        </div>

        <RevokeSessionDialog
          isLoading={isRevokingAll}
          onConfirm={handleLogoutAllDevices}
        />
      </div>

      {/* ── Session list ── */}
      {loading ? (
        <SessionsSkeleton />
      ) : (
        <SessionList
          sessions={sessions}
          revokingSessionIds={revokingSessionIds}
          onRevoke={handleRemoveSession}
        />
      )}

      {/* ── Security tip ── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-4">
          <Shield className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            See an unfamiliar device?{" "}
            <span className="font-medium text-foreground">Remove it immediately</span>{" "}
            to keep your account secure.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}