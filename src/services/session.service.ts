// src/services/session.service.ts

import { api } from "@/lib/api";
import { GetSessionsResponse, Session } from "@/types/session.types";

export const sessionService = {
  async getSessions(): Promise<Session[]> {
    const res = await api.get<GetSessionsResponse>("/auth/session");
    return res.data.sessions;
  },

  async revokeSession(sessionId: string) {
    return api.delete(`/auth/session/${sessionId}`);
  },

  async revokeAllSessions() {
    return api.post("/auth/session/revoke-all");
  },
};