// -----------------------------
// Find OAuth account
// -----------------------------

import { Provider } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function findOAuthAccount(provider: Provider, providerAccountId: string) {
    return prisma.oAuthAccount.findUnique({
        where: {
            provider_providerAccountId: {
                provider,
                providerAccountId,
            },
        },

        include: {
            user: true,
        },
    });
}

// -----------------------------
// Create OAuth account
// -----------------------------

export async function createOAuthAccount(data: {
    userId: string;
    provider: Provider;
    providerAccountId: string;
    email?: string;
}) {
    return prisma.oAuthAccount.create({
        data: {
            userId: data.userId,
            provider: data.provider,
            providerAccountId:
                data.providerAccountId,
            email: data.email,
        },
    });
}

// -----------------------------
// Create OAuth user
// -----------------------------

export async function createOAuthUser(data: {
  name: string;
  email: string;
}) {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,

      // Google already verifies email
      isVerified: true,

      // no password for OAuth user
      password: null,
    },
  });
}