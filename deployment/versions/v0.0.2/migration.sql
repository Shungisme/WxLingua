-- WxLingua v0.0.2 Database Migration
-- PostgreSQL 16
-- Generated: 2026-03-11
-- Applied via Prisma migrations: 20260309101928_init, 20260309114144_add_deck_card_model
--
-- For a FRESH install, run Prisma migrations instead of executing this file directly:
--   npx prisma migrate deploy
--
-- This file documents the combined schema delta from v0.0.1 → v0.0.2.

-- ========================================================
-- Migration 1: 20260309101928_init
-- Full schema with FSRS fields, ReviewLog, PasswordResetToken
-- ========================================================

-- New enum: CardState (replaces MasteryLevel from v0.0.1)
CREATE TYPE "CardState" AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'RELEARNING');

-- Drop old MasteryLevel enum and related column (if upgrading from v0.0.1)
-- ALTER TABLE "UserWord" DROP COLUMN IF EXISTS "masteryLevel";
-- DROP TYPE IF EXISTS "MasteryLevel";

-- New table: PasswordResetToken
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

ALTER TABLE "PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- New table: ReviewLog
CREATE TABLE "ReviewLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "userWordId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "state" "CardState" NOT NULL,
    "scheduledDays" INTEGER NOT NULL DEFAULT 0,
    "elapsedDays" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "prevStability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "prevDifficulty" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "prevStreak" INTEGER NOT NULL DEFAULT 0,
    "prevNextReview" TIMESTAMP(3),
    "prevState" "CardState" NOT NULL DEFAULT 'NEW',
    "prevEfactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ReviewLog_userId_idx" ON "ReviewLog"("userId");
CREATE INDEX "ReviewLog_userWordId_idx" ON "ReviewLog"("userWordId");
CREATE INDEX "ReviewLog_reviewedAt_idx" ON "ReviewLog"("reviewedAt");

ALTER TABLE "ReviewLog"
    ADD CONSTRAINT "ReviewLog_userWordId_fkey"
    FOREIGN KEY ("userWordId") REFERENCES "UserWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update UserWord: add FSRS columns (if upgrading from v0.0.1)
ALTER TABLE "UserWord"
    ADD COLUMN IF NOT EXISTS "stability"  DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 5,
    ADD COLUMN IF NOT EXISTS "lapses"     INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "state"      "CardState" NOT NULL DEFAULT 'NEW',
    ADD COLUMN IF NOT EXISTS "lastReview" TIMESTAMP(3);

-- Update Deck: add cardCount column (if upgrading from v0.0.1)
ALTER TABLE "Deck"
    ADD COLUMN IF NOT EXISTS "cardCount" INTEGER NOT NULL DEFAULT 0;

-- ========================================================
-- Migration 2: 20260309114144_add_deck_card_model
-- Drop DeckWord, create DeckCard
-- ========================================================

-- Drop old DeckWord join table
ALTER TABLE "DeckWord" DROP CONSTRAINT IF EXISTS "DeckWord_deckId_fkey";
ALTER TABLE "DeckWord" DROP CONSTRAINT IF EXISTS "DeckWord_wordId_fkey";
DROP TABLE IF EXISTS "DeckWord";

-- New table: DeckCard
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

CREATE INDEX "DeckCard_deckId_idx" ON "DeckCard"("deckId");
CREATE INDEX "DeckCard_deckId_nextReview_idx" ON "DeckCard"("deckId", "nextReview");
CREATE UNIQUE INDEX "DeckCard_deckId_term_key" ON "DeckCard"("deckId", "term");

ALTER TABLE "DeckCard"
    ADD CONSTRAINT "DeckCard_deckId_fkey"
    FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DeckCard"
    ADD CONSTRAINT "DeckCard_sourceWordId_fkey"
    FOREIGN KEY ("sourceWordId") REFERENCES "Word"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ========================================================
-- Post-migration verification
-- ========================================================

-- Verify new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables after v0.0.2:
-- DeckCard, Deck, PasswordResetToken, Radical, ReviewLog,
-- User, UserWord, Word, WordRadical

-- Verify DeckWord is gone
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'DeckWord';
-- Expected: 0

-- Verify CardState enum
SELECT enumlabel FROM pg_enum
JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
WHERE pg_type.typname = 'CardState';
-- Expected: NEW, LEARNING, REVIEW, RELEARNING

-- Verify row counts
SELECT 'Radicals' AS table_name, COUNT(*) AS count FROM "Radical"
UNION ALL
SELECT 'Words', COUNT(*) FROM "Word"
UNION ALL
SELECT 'Users', COUNT(*) FROM "User"
UNION ALL
SELECT 'DeckCard', COUNT(*) FROM "DeckCard";

-- Expected after seeding:
-- Radicals: 214+
-- Words: 124,000+ (after import-cedict)
-- Users: 1+ (demo user)
-- DeckCard: 0 (populated by users)
