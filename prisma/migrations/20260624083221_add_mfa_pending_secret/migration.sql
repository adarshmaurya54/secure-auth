/*
  Warnings:

  - You are about to drop the `TempMfaToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEvent" ADD VALUE 'MFA_SETUP_STARTED';
ALTER TYPE "AuditEvent" ADD VALUE 'MFA_BACKUP_CODES_REGENERATED';

-- DropForeignKey
ALTER TABLE "TempMfaToken" DROP CONSTRAINT "TempMfaToken_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mfaPendingSecret" TEXT;

-- DropTable
DROP TABLE "TempMfaToken";

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
