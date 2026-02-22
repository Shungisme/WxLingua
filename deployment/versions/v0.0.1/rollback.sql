-- WxLingua v0.0.1 Rollback Script
-- Use this if you need to rollback to pre-v0.0.1 state

-- WARNING: This will delete all data!
-- Make sure you have a backup before running this

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS "DeckWord" CASCADE;
DROP TABLE IF EXISTS "UserWord" CASCADE;
DROP TABLE IF EXISTS "WordRadical" CASCADE;
DROP TABLE IF EXISTS "Deck" CASCADE;
DROP TABLE IF EXISTS "Word" CASCADE;
DROP TABLE IF EXISTS "Radical" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Drop enums
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "Visibility" CASCADE;
DROP TYPE IF EXISTS "MasteryLevel" CASCADE;

-- Verify cleanup
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should return empty result

-- To restore from backup:
-- psql -U postgres -d wxlingua < backup_YYYYMMDD_HHMMSS.sql
