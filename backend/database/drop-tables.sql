-- =============================================
-- DROP ALL TABLES - WxLingua Database
-- =============================================
-- ⚠️  WARNING: This will DELETE ALL DATA
-- ⚠️  Only use in development or with proper backup
-- =============================================

-- Drop tables in reverse dependency order

DROP TABLE IF EXISTS "DeckWord" CASCADE;
DROP TABLE IF EXISTS "UserWord" CASCADE;
DROP TABLE IF EXISTS "WordRadical" CASCADE;
DROP TABLE IF EXISTS "Deck" CASCADE;
DROP TABLE IF EXISTS "Word" CASCADE;
DROP TABLE IF EXISTS "Radical" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Drop enums
DROP TYPE IF EXISTS "Role" CASCADE;

-- Drop Prisma migration table (optional - uncomment if needed)
-- DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- Verify tables are dropped
DO $$
BEGIN
    RAISE NOTICE 'All tables dropped successfully';
END $$;
