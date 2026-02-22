-- =============================================
-- INITIALIZE TABLES - WxLingua Database
-- =============================================
-- Creates all tables, enums, and indexes
-- Based on Prisma schema (prisma/schema.prisma)
-- =============================================

-- Enable UUID extension (if using UUIDs)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CREATE ENUMS
-- =============================================

CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- =============================================
-- 2. CREATE TABLES
-- =============================================

-- Table: User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Table: Radical
CREATE TABLE "Radical" (
    "id" TEXT NOT NULL,
    "char" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "strokeCount" INTEGER NOT NULL,
    "meaning" JSONB NOT NULL,
    "imageUrl" TEXT,
    "frequency" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Radical_pkey" PRIMARY KEY ("id")
);

-- Table: Word
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "frequency" INTEGER,
    "level" TEXT,
    "metadata" JSONB,
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- Table: WordRadical
CREATE TABLE "WordRadical" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "radicalId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordRadical_pkey" PRIMARY KEY ("id")
);

-- Table: UserWord
CREATE TABLE "UserWord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "nextReview" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "efactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWord_pkey" PRIMARY KEY ("id")
);

-- Table: Deck
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "languageCode" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "cardCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- Table: DeckWord
CREATE TABLE "DeckWord" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeckWord_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- 3. CREATE UNIQUE CONSTRAINTS
-- =============================================

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Radical_char_key" ON "Radical"("char");
CREATE UNIQUE INDEX "Word_word_key" ON "Word"("word");
CREATE UNIQUE INDEX "WordRadical_wordId_radicalId_key" ON "WordRadical"("wordId", "radicalId");
CREATE UNIQUE INDEX "UserWord_userId_wordId_key" ON "UserWord"("userId", "wordId");
CREATE UNIQUE INDEX "DeckWord_deckId_wordId_key" ON "DeckWord"("deckId", "wordId");

-- =============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");

-- Word indexes
CREATE INDEX "Word_languageCode_idx" ON "Word"("languageCode");
CREATE INDEX "Word_frequency_idx" ON "Word"("frequency");
CREATE INDEX "Word_word_idx" ON "Word"("word");

-- Radical indexes
CREATE INDEX "Radical_strokeCount_idx" ON "Radical"("strokeCount");
CREATE INDEX "Radical_frequency_idx" ON "Radical"("frequency");

-- UserWord indexes
CREATE INDEX "UserWord_userId_idx" ON "UserWord"("userId");
CREATE INDEX "UserWord_userId_nextReview_idx" ON "UserWord"("userId", "nextReview");

-- Deck indexes
CREATE INDEX "Deck_userId_idx" ON "Deck"("userId");
CREATE INDEX "Deck_isPublic_idx" ON "Deck"("isPublic");

-- =============================================
-- 5. ADD FOREIGN KEY CONSTRAINTS
-- =============================================

-- WordRadical foreign keys
ALTER TABLE "WordRadical" ADD CONSTRAINT "WordRadical_wordId_fkey" 
    FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WordRadical" ADD CONSTRAINT "WordRadical_radicalId_fkey" 
    FOREIGN KEY ("radicalId") REFERENCES "Radical"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- UserWord foreign keys
ALTER TABLE "UserWord" ADD CONSTRAINT "UserWord_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "UserWord" ADD CONSTRAINT "UserWord_wordId_fkey" 
    FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Deck foreign keys
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DeckWord foreign keys
ALTER TABLE "DeckWord" ADD CONSTRAINT "DeckWord_deckId_fkey" 
    FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DeckWord" ADD CONSTRAINT "DeckWord_wordId_fkey" 
    FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================
-- COMPLETE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Database schema initialized successfully';
    RAISE NOTICE 'Tables created: User, Radical, Word, WordRadical, UserWord, Deck, DeckWord';
END $$;
