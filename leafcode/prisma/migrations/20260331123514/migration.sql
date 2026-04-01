/*
  Warnings:

  - You are about to drop the column `totTime` on the `UserChallenge` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[submissionName]` on the table `Challenge` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[challengeId,language]` on the table `StartingCode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `co2Consumed` to the `UserChallenge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "submissionName" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "UserChallenge" DROP COLUMN "totTime",
ADD COLUMN     "co2Consumed" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_submissionName_key" ON "Challenge"("submissionName");

-- CreateIndex
CREATE UNIQUE INDEX "StartingCode_challengeId_language_key" ON "StartingCode"("challengeId", "language");
