-- CreateTable
CREATE TABLE "StartingCode" (
    "id" SERIAL NOT NULL,
    "language" "Language" NOT NULL,
    "code" TEXT NOT NULL,
    "challengeId" INTEGER NOT NULL,

    CONSTRAINT "StartingCode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StartingCode" ADD CONSTRAINT "StartingCode_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
