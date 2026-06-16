import { redis } from "@/lib/redis";
import { getUserSession } from "../../repository/auth.repository";
import { formatDistanceToNow } from "date-fns";

export async function getUserSessionsService(userId: string, currentSessionId: string) {
    const cacheKey = `sessions:${userId}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
        console.log("returned cached values")
        const sessions = JSON.parse(cached);
        // re-apply isCurrent dynamically
        return sessions.map((s: any) => ({
            ...s,
            isCurrent: s.id === currentSessionId,
        }));
    }

    // db called
    const sessions = await getUserSession(userId);


    const formattedSession = sessions.map((session) => ({
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

    await redis.set(cacheKey, JSON.stringify(formattedSession), "EX", 60 * 5)

    return formattedSession;
}