import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import {RegisterInput} from "@/modules/auth/validators/auth.validators"
import { gt } from "zod";

type tx = Prisma.TransactionClient;

export async function findUserByEmail(email: string, tx?: tx) {
    const client = tx ?? prisma;
    return await client.user.findUnique({
        where: {email},
    })
}
export async function findUserByUserId(userId: string) {
    const cacheKey = `user:${userId}`;

    const cached = await redis.get(cacheKey);
    if(cached) return JSON.parse(cached);

    const user = await prisma.user.findUnique({
        where: {id: userId},
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isVerified: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    })

    if(user) {
        await redis.set(cacheKey, JSON.stringify(user), "EX", 60 * 15);
    }

    return user;
}

export async function updateUserPasswordByUserId(userId: string, hashPassword: string){
    return await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            password: hashPassword
        }
    })
}


export async function findSessionBySessionId(sessionId: string){
    const cacheKey = `session:${sessionId}`;
    const cached = await redis.get(cacheKey);
    if(cached) return JSON.parse(cached);

    const session = await prisma.session.findUnique({
        where: {
            id: sessionId
        }
    })
    if(session) {
        await redis.set(cacheKey, JSON.stringify(session), "EX", 60 * 15);
    }

    return session;
}

export async function deleteVerificationCodeByUserId(userId: string) {
    return await prisma.verificationCode.deleteMany({
        where: {
            userId
        }
    })
}

export async function storeVerificationCode(userId: string, hashedVerificationCode: string, expiresAt: Date){
    return await prisma.verificationCode.create({
        data: {
            userId,
            codeHash: hashedVerificationCode,
            expiresAt
        }
    })
}

export async function createUser(data: RegisterInput, tx?: tx) {
    const client = tx ?? prisma;
    return await client.user.create({
        data,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        }
    })
}

export async function createSession(data: Prisma.SessionUncheckedCreateInput){
    return await prisma.session.create({
        data,
    })
}

export async function updateLastLogin(userId: string) {
    await prisma.user.update({
        where: {id: userId},
        data: {lastLogin: new Date()},
    })
}

export async function revokeSessionByRefreshTokenHash(refreshTokenHash: string) {
    const session = await prisma.session.update({
        where: { refreshTokenHash },
        data: { isRevoked: true },
    });

    // clean Redis
    await redis.del(`session:${session.id}`);

    return session;
}

export async function revokeSessionBySessionId(sessionId: string) {
    const session = await prisma.session.update({
        where: { id: sessionId },
        data: { isRevoked: true },
    });

    // clean Redis
    await redis.del(`session:${session.id}`);

    return session;
}

export async function revokeAllSessions(userId: string) {
    // 1. fetch IDs FIRST before revoking
    const sessions = await prisma.session.findMany({
        where: { userId, isRevoked: false },
        select: { id: true },
    });

    // 2. revoke in DB
    await prisma.session.updateMany({
        where: { userId },
        data: { isRevoked: true },
    });

    // 3. clean Redis for each session
    await Promise.all(
        sessions.map((s) => redis.del(`session:${s.id}`))
    );

    // 4. clean user cache too
    await redis.del(`user:${userId}`);
    await redis.del(`sessions:${userId}`);
}

// revoke all sessions except current
export async function revokeAllSessionsExcept(userId: string, keepSessionId: string) {
    // fetch all OTHER session IDs first (for Redis cleanup)
    const sessions = await prisma.session.findMany({
        where: {
            userId,
            id: { not: keepSessionId },
            isRevoked: false,
        },
        select: { id: true },
    });

    // revoke in DB
    await prisma.session.updateMany({
        where: {
            userId,
            id: { not: keepSessionId },
        },
        data: { isRevoked: true },
    });

    // clean up Redis for each revoked session
    await Promise.all(
        sessions.map((s) => redis.del(`session:${s.id}`))
    );
}


// -----------------------------------------
// methods for refres token
export async function updateSessionBySessionId(sessionId: string, refreshTokenHash: string, expiresAt: Date) {
    return await prisma.session.update({
        where: {id: sessionId},
        data: {
            refreshTokenHash,
            expiresAt
        }
    })
}
export async function deleteSessionByUserId(userId: string) {
    return await prisma.session.deleteMany({
        where: {
            userId
        }
    })
}
// -------------------------------------------

export async function findSessionByRefreshToken(refreshTokenHash: string){
    return await prisma.session.findUnique({
        where: {refreshTokenHash: refreshTokenHash}
    })
}

// -----------------------------------------
// methods for reset password token
export async function deletePasswordResetTokenByUserId(userId: string) {
    return await prisma.passwordResetToken.deleteMany({
        where: {
            userId,
        }
    })
}

export async function createPasswordResetToken(userId: string, hashToken: string, tokenExpiry: Date) {
    return await prisma.passwordResetToken.create({
        data: {
            userId,
            token: hashToken,
            expiresAt: tokenExpiry
        }
    })
}

export async function findPasswordResetToken(hashToken: string){
    return await prisma.passwordResetToken.findUnique({
        where: {
            token: hashToken
        },
        select: {
            id: true,
            userId: true,
            token: true,
            expiresAt: true,
            createdAt: true, 
            user: true
        }
    })
}

// -----------------------------------------


export async function updateSessionActivity(sessionId: string) {
    const debounceKey = `session-activity-updated:${sessionId}`;

    //Only update DB if not updated in last 5 minutes
    const alreadyUpdated = await redis.get(debounceKey);
    if(alreadyUpdated) return; // skip db write
    
    await prisma.session.update({
        where: {
            id: sessionId
        },
        data: {
            lastUsedAt: new Date()
        }
    })

    await redis.set(debounceKey, "1", "EX", 60 * 5);
}


export async function getUserSession(userId: string ) {
    return await prisma.session.findMany({
        where: {
            userId,

            isRevoked: false,

            expiresAt: {
                gt: new Date()
            }
        },

        orderBy: {
            lastUsedAt: "desc"
        }
    })
}