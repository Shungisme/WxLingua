/*
  Warnings:

  - You are about to drop the `DeckWord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeckWord" DROP CONSTRAINT "DeckWord_deckId_fkey";

-- DropForeignKey
ALTER TABLE "DeckWord" DROP CONSTRAINT "DeckWord_wordId_fkey";

-- DropTable
DROP TABLE "DeckWord";

-- CreateTable
CREATE TABLE "DeckCard" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "sourceWordId" TEXT,
    "term" TEXT NOT NULL,
    "meaning" JSONB,
    "pronunciation" TEXT,
    "imageUrl" TEXT,
    "audioUrl" TEXT,
    "notes" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "nextReview" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "efactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "state" "CardState" NOT NULL DEFAULT 'NEW',
    "lastReview" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeckCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeckCard_deckId_idx" ON "DeckCard"("deckId");

-- CreateIndex
CREATE INDEX "DeckCard_deckId_nextReview_idx" ON "DeckCard"("deckId", "nextReview");

-- CreateIndex
CREATE UNIQUE INDEX "DeckCard_deckId_term_key" ON "DeckCard"("deckId", "term");

-- AddForeignKey
ALTER TABLE "DeckCard" ADD CONSTRAINT "DeckCard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckCard" ADD CONSTRAINT "DeckCard_sourceWordId_fkey" FOREIGN KEY ("sourceWordId") REFERENCES "Word"("id") ON DELETE SET NULL ON UPDATE CASCADE;
