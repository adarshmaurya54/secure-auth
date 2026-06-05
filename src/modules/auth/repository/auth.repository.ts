import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {RegisterInput} from "@/modules/auth/validators/auth.validators"

type tx = Prisma.TransactionClient;

export async function findUserByEmail(email: string, tx?: tx) {
    const client = tx ?? prisma;
    return await client.user.findUnique({
        where: {email},
    })
}

export async function findUserByUserId(userId: string, tx?: tx) {
    const client = tx ?? prisma;
    return await client.user.findUnique({
        where: {id: userId},
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

export async function storeVerificationToken(userId: string, token: string, expiry: Date, tx?: tx) {
    const client = tx ?? prisma;
    return await client.verificationToken.create({
        data: {
            userId,
            token,
            expiresAt: expiry,
        },
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

export async function deleteSessionByRefreshToken(refreshTokenHash: string) {
    return await prisma.session.delete({
        where: {
            refreshTokenHash
        }
    })
}

export async function deleteSessionBySessionId(sessionId: string) {
    return await prisma.session.delete({
        where: {
            id: sessionId
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

export async function findSessionByRefreshToken(refreshTokenHash: string){
    return await prisma.session.findUnique({
        where: {refreshTokenHash: refreshTokenHash}
    })
}