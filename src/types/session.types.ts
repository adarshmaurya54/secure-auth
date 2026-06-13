export type SessionDeviceType =
    | "Desktop"
    | "Mobile"
    | "Tablet"
    | "Unknown";

export interface Session {
    id: string;
    deviceName: string;
    browser: string | null;
    os: string | null;
    device: SessionDeviceType;
    ipAddress: string | null;
    lastActive: string;
    isCurrent: boolean;
}

export interface GetSessionsResponse {
  success: boolean;
  sessions: Session[];
}