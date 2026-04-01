/*
  Warnings:

  - You are about to drop the column `submissionName` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `co2Consumed` on the `UserChallenge` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Challenge_submissionName_key";

-- DropIndex
DROP INDEX "StartingCode_challengeId_language_key";

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "submissionName";

-- AlterTable
ALTER TABLE "UserChallenge" DROP COLUMN "co2Consumed";
