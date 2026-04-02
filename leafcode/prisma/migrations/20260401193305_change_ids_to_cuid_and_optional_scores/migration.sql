/*
  Warnings:

  - The primary key for the `Challenge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `StartingCode` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "StartingCode" DROP CONSTRAINT "StartingCode_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "UserChallenge" DROP CONSTRAINT "UserChallenge_challengeId_fkey";

-- AlterTable
ALTER TABLE "Challenge" DROP CONSTRAINT "Challenge_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Challenge_id_seq";

-- AlterTable
ALTER TABLE "StartingCode" DROP CONSTRAINT "StartingCode_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "challengeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "StartingCode_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "StartingCode_id_seq";

-- AlterTable
ALTER TABLE "UserChallenge" ALTER COLUMN "challengeId" SET DATA TYPE TEXT,
ALTER COLUMN "score" DROP NOT NULL,
ALTER COLUMN "energyConsumed" DROP NOT NULL,
ALTER COLUMN "totTime" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "StartingCode" ADD CONSTRAINT "StartingCode_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallenge" ADD CONSTRAINT "UserChallenge_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
