import { prisma } from "@/lib/prisma";

export async function savePendingMfaSecret(
    userId: string,
    secret: string
) {
    return await prisma.user.update({
        where: { id: userId },
        data: {
            mfaPendingSecret: secret
        }
    });
}

export async function enableMfa(
    userId: string,
    data: {
        mfaSecret: string;
        mfaBackupCodes: string[];
    }
) {
    return prisma.user.update({
        where: { id: userId },
        data: {
            mfaEnabled: true,
            mfaPendingSecret: null,
            mfaSecret: data.mfaSecret,
            mfaBackupCodes: data.mfaBackupCodes
        }
    });
}

export async function disableMfa(userId: string) {
    return prisma.user.update({
        where: {
            id: userId
        },
        data: {
            mfaEnabled: false,
            mfaSecret: null,
            mfaBackupCodes: []
        }
    });
}