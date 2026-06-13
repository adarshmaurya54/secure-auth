import { getUserSession } from "../../repository/auth.repository";
import { formatDistanceToNow } from "date-fns";

export async function getUserSessionsService(userId: string, currentSessionId: string) {
    const sessions = await getUserSession(userId);

    return sessions.map((session) => ({
        id: session.id,

        deviceName:
            `${session.browser || "Unknown"} on ${session.os || "Unknown"
            } ${session.device === "Mobile"
                ? "Phone"
                : "PC"
            }`,

        browser: session.browser,

        os: session.os,

        device: session.device,

        ipAddress: session.ipAddress,

        lastActive:
            formatDistanceToNow(
                session.lastUsedAt,
                {
                    addSuffix: true,
                }
            ),

        isCurrent:
            session.id === currentSessionId,
    }));
}