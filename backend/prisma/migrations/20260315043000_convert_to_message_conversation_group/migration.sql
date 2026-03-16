-- Rename direct message tables to generic message tables
ALTER TABLE "DirectMessageConversation" RENAME TO "MessageConversation";
ALTER TABLE "DirectMessage" RENAME TO "Message";

-- Keep naming aligned with Prisma conventions after table rename
ALTER TABLE "MessageConversation" RENAME CONSTRAINT "DirectMessageConversation_pkey" TO "MessageConversation_pkey";
ALTER TABLE "Message" RENAME CONSTRAINT "DirectMessage_pkey" TO "Message_pkey";
ALTER TABLE "Message" RENAME CONSTRAINT "DirectMessage_conversationId_fkey" TO "Message_conversationId_fkey";
ALTER TABLE "Message" RENAME CONSTRAINT "DirectMessage_senderId_fkey" TO "Message_senderId_fkey";

-- Drop conversation indexes/constraints based on old participantOne/participantTwo columns
DROP INDEX "DirectMessageConversation_participantOneId_updatedAt_idx";
DROP INDEX "DirectMessageConversation_participantTwoId_updatedAt_idx";
DROP INDEX "DirectMessageConversation_participantOneId_participantTwoId_key";
ALTER TABLE "MessageConversation" DROP CONSTRAINT "DirectMessageConversation_participantOneId_fkey";
ALTER TABLE "MessageConversation" DROP CONSTRAINT "DirectMessageConversation_participantTwoId_fkey";

-- Add group-chat fields and participant array
ALTER TABLE "MessageConversation"
  ADD COLUMN "isGroup" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "name" TEXT,
  ADD COLUMN "avatar" TEXT,
  ADD COLUMN "participantIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "directKey" TEXT;

-- Backfill participant array and direct key from old direct-message columns
UPDATE "MessageConversation"
SET
  "participantIds" = ARRAY[
    LEAST("participantOneId", "participantTwoId"),
    GREATEST("participantOneId", "participantTwoId")
  ]::TEXT[],
  "directKey" = LEAST("participantOneId", "participantTwoId") || ':' || GREATEST("participantOneId", "participantTwoId");

ALTER TABLE "MessageConversation"
  ALTER COLUMN "participantIds" SET NOT NULL,
  ALTER COLUMN "participantIds" DROP DEFAULT;

-- Remove old participant columns after migration to participantIds
ALTER TABLE "MessageConversation"
  DROP COLUMN "participantOneId",
  DROP COLUMN "participantTwoId";

-- Recreate indexes with names expected by current Prisma schema
CREATE UNIQUE INDEX "MessageConversation_directKey_key" ON "MessageConversation"("directKey");
CREATE INDEX "MessageConversation_updatedAt_idx" ON "MessageConversation"("updatedAt");
CREATE INDEX "MessageConversation_isGroup_updatedAt_idx" ON "MessageConversation"("isGroup", "updatedAt");

DROP INDEX "DirectMessage_conversationId_createdAt_idx";
DROP INDEX "DirectMessage_senderId_idx";
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");
