/*
  Warnings:

  - You are about to drop the column `accessToken` on the `OAuthAccount` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `OAuthAccount` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `OAuthAccount` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `OAuthAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUsedAt` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEvent" ADD VALUE 'OAUTH_LOGIN';
ALTER TYPE "AuditEvent" ADD VALUE 'MFA_ENABLED';
ALTER TYPE "AuditEvent" ADD VALUE 'MFA_DISABLED';
ALTER TYPE "AuditEvent" ADD VALUE 'MFA_VERIFY_SUCCESS';
ALTER TYPE "AuditEvent" ADD VALUE 'MFA_VERIFY_FAILED';
ALTER TYPE "AuditEvent" ADD VALUE 'MFA_BACKUP_CODE_USED';

-- AlterTable
ALTER TABLE "OAuthAccount" DROP COLUMN "accessToken",
DROP COLUMN "expiresAt",
DROP COLUMN "refreshToken",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "lastUsedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "os" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mfaBackupCodes" TEXT[],
ADD COLUMN     "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mfaSecret" TEXT;

-- CreateTable
CREATE TABLE "TempMfaToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TempMfaToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TempMfaToken_tokenHash_key" ON "TempMfaToken"("tokenHash");

-- CreateIndex
CREATE INDEX "TempMfaToken_userId_idx" ON "TempMfaToken"("userId");

-- CreateIndex
CREATE INDEX "OAuthAccount_userId_idx" ON "OAuthAccount"("userId");

-- AddForeignKey
ALTER TABLE "TempMfaToken" ADD CONSTRAINT "TempMfaToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
