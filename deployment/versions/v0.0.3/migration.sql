-- WxLingua v0.0.3 Database Migration
-- PostgreSQL 16
-- Generated: 2026-03-17
-- Applied via Prisma migrations:
--   20260315023626_add_friend_and_direct_messages
--   20260315043000_convert_to_message_conversation_group
--
-- For production, use:
--   npx prisma migrate deploy
--
-- This file documents the effective schema changes from v0.0.2 -> v0.0.3.

-- ========================================================
-- Migration 1: add_friend_and_direct_messages
-- ========================================================

CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED');

CREATE TABLE "FriendRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DirectMessageConversation" (
    "id" TEXT NOT NULL,
    "participantOneId" TEXT NOT NULL,
    "participantTwoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DirectMessageConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DirectMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);

-- ========================================================
-- Migration 2: convert_to_message_conversation_group
-- ========================================================

ALTER TABLE "DirectMessageConversation" RENAME TO "MessageConversation";
ALTER TABLE "DirectMessage" RENAME TO "Message";

ALTER TABLE "MessageConversation"
  ADD COLUMN "isGroup" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "name" TEXT,
  ADD COLUMN "avatar" TEXT,
  ADD COLUMN "participantIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "directKey" TEXT;

-- Note: Prisma migration also includes index/constraint updates and participant backfill.

-- ========================================================
-- Verification
-- ========================================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('FriendRequest', 'Friendship', 'MessageConversation', 'Message')
ORDER BY table_name;

SELECT enumlabel
FROM pg_enum
JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
WHERE pg_type.typname = 'FriendRequestStatus';
