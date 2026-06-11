import { Prisma } from "@/generated/prisma/client";
import { AuditEvent } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

type CreateAuditLogParams = {
    userId?: string;
    event: AuditEvent;
    ipAddress?: string;
    device?: string;
    metadata?: Prisma.InputJsonValue;
}

export async function createAuditLog(
    {
        userId,
        event,
        ipAddress,
        device,
        metadata,
    }: CreateAuditLogParams
){
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                event,
                ipAddress,
                device,
                metadata,
            }
        })
    } catch (error) {
        console.error("Failed to create audit log:", error);
    }
}