/*
  Warnings:

  - You are about to drop the column `co2Consumed` on the `UserChallenge` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Challenge` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[challengeId,language]` on the table `StartingCode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totTime` to the `UserChallenge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "energyTest" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserChallenge" DROP COLUMN "co2Consumed",
ADD COLUMN     "totTime" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_slug_key" ON "Challenge"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "StartingCode_challengeId_language_key" ON "StartingCode"("challengeId", "language");
