-- WxLingua v0.0.2 Rollback Script
-- Reverts from v0.0.2 back to v0.0.1 schema
--
-- WARNING: This will DESTROY all DeckCard data and FSRS review history!
-- Ensure you have a full database backup before running this.
--
-- Restore from backup instead when possible:
--   ./deployment/scripts/restore.sh backups/wxlingua_production_YYYYMMDD_HHMMSS.sql.gz production

-- ========================================================
-- Step 1: Drop v0.0.2-only tables
-- ========================================================

DROP TABLE IF EXISTS "DeckCard" CASCADE;
DROP TABLE IF EXISTS "ReviewLog" CASCADE;
DROP TABLE IF EXISTS "PasswordResetToken" CASCADE;

-- ========================================================
-- Step 2: Re-create DeckWord (v0.0.1 join table)
-- ========================================================

CREATE TABLE "DeckWord" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeckWord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeckWord_deckId_wordId_key" ON "DeckWord"("deckId", "wordId");

ALTER TABLE "DeckWord"
    ADD CONSTRAINT "DeckWord_deckId_fkey"
    FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DeckWord"
    ADD CONSTRAINT "DeckWord_wordId_fkey"
    FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================================
-- Step 3: Remove FSRS columns from UserWord
-- ========================================================

ALTER TABLE "UserWord"
    DROP COLUMN IF EXISTS "stability",
    DROP COLUMN IF EXISTS "difficulty",
    DROP COLUMN IF EXISTS "lapses",
    DROP COLUMN IF EXISTS "state",
    DROP COLUMN IF EXISTS "lastReview";

-- ========================================================
-- Step 4: Remove cardCount from Deck
-- ========================================================

ALTER TABLE "Deck"
    DROP COLUMN IF EXISTS "cardCount";

-- ========================================================
-- Step 5: Drop CardState enum
-- ========================================================

DROP TYPE IF EXISTS "CardState";

-- ========================================================
-- Step 6: Re-create MasteryLevel enum (v0.0.1)
-- ========================================================

CREATE TYPE "MasteryLevel" AS ENUM ('NEW', 'LEARNING', 'YOUNG', 'MATURE', 'MASTER');

ALTER TABLE "UserWord"
    ADD COLUMN "masteryLevel" "MasteryLevel" NOT NULL DEFAULT 'NEW';

-- ========================================================
-- Verification
-- ========================================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected after rollback:
-- Deck, DeckWord, Radical, User, UserWord, Word, WordRadical

SELECT COUNT(*) FROM "DeckWord";     -- should be 0 (empty)
SELECT COUNT(*) FROM "DeckCard";     -- should fail (table dropped)
