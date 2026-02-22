-- WxLingua v0.0.1 Database Schema
-- PostgreSQL 16
-- Generated: 2026-02-22

-- This is the initial schema, applied via Prisma migrations
-- No manual migration needed for v0.0.1

-- To apply this schema:
-- 1. Ensure DATABASE_URL is set in .env
-- 2. Run: npx prisma db push
-- 3. Run: npx prisma db seed

-- Schema will be created automatically by Prisma based on schema.prisma

-- Post-deployment verification queries:

-- Check if all tables are created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables:
-- - User
-- - Word
-- - Radical
-- - WordRadical
-- - Deck
-- - DeckWord
-- - UserWord

-- Check indexes
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Verify seed data
SELECT 'Radicals' as table_name, COUNT(*) as count FROM "Radical"
UNION ALL
SELECT 'Words', COUNT(*) FROM "Word"
UNION ALL
SELECT 'Users', COUNT(*) FROM "User";

-- Expected counts after seeding:
-- Radicals: 214+
-- Words: 100+ (depends on seed data)
-- Users: 1+ (demo user)
