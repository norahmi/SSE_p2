-- CreateEnum
CREATE TYPE "Language" AS ENUM ('PYTHON', 'CPP', 'JAVASCRIPT', 'TYPESCRIPT', 'RUST', 'GO', 'JAVA', 'KOTLIN');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "totScore" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Challenge" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "language" "Language" NOT NULL,
    "energyConsumed" INTEGER NOT NULL,
    "co2Consumed" INTEGER NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserChallenge_userId_idx" ON "UserChallenge"("userId");

-- CreateIndex
CREATE INDEX "UserChallenge_challengeId_idx" ON "UserChallenge"("challengeId");

-- AddForeignKey
ALTER TABLE "UserChallenge" ADD CONSTRAINT "UserChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallenge" ADD CONSTRAINT "UserChallenge_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
