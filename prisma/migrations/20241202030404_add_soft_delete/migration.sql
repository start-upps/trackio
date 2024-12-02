/*
  Warnings:

  - You are about to drop the column `archived` on the `habits` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "habits_archived_idx";

-- AlterTable
ALTER TABLE "habits" DROP COLUMN "archived",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "habits_isDeleted_idx" ON "habits"("isDeleted");
