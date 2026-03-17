-- WxLingua v0.0.3 Rollback Script
-- WARNING: This rollback can cause data loss for social/chat features.
-- Prefer restoring from a full database backup.

-- Step 1: Drop v0.0.3 social/chat tables
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "MessageConversation" CASCADE;
DROP TABLE IF EXISTS "Friendship" CASCADE;
DROP TABLE IF EXISTS "FriendRequest" CASCADE;

-- Step 2: Drop enum
DROP TYPE IF EXISTS "FriendRequestStatus";

-- Verification
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('FriendRequest', 'Friendship', 'MessageConversation', 'Message');

-- Expected: no rows
