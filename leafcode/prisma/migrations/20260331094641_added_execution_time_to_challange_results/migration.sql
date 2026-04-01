/*
  Warnings:

  - You are about to drop the column `co2Consumed` on the `UserChallenge` table. All the data in the column will be lost.
  - Added the required column `totTime` to the `UserChallenge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserChallenge" DROP COLUMN "co2Consumed",
ADD COLUMN     "totTime" INTEGER NOT NULL;
