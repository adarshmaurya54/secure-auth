"use client";

import { useEffect, useState } from "react";
import { sessionService } from "@/services/session.service";
import { Session } from "@/types/session.types";

export function useSession() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const getSessions = async () => {
    try {
      const data = await sessionService.getSessions();
      setSessions(data);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSessions();
  }, []);

  return {
    sessions,
    loading,
    setSessions,
    refetchSessions: getSessions,
  };
}