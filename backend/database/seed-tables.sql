-- =============================================
-- SEED TABLES - WxLingua Database
-- =============================================
-- Populates database with initial data
-- Run after init-tables.sql
-- =============================================

-- =============================================
-- 1. SEED USERS
-- =============================================

-- Admin user (password: admin123 - hashed with bcrypt)
INSERT INTO "User" ("id", "email", "password", "name", "role", "createdAt", "updatedAt")
VALUES 
    ('admin_001', 'admin@wxlingua.com', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlzoevm/lXk5TnkHaLq0Z9VQ/bW', 'Admin User', 'ADMIN', NOW(), NOW()),
    ('user_001', 'user@example.com', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlzoevm/lXk5TnkHaLq0Z9VQ/bW', 'Test User', 'USER', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- =============================================
-- 2. SEED RADICALS
-- =============================================
-- 
-- NOTE: All 214 Kangxi radicals are imported separately
-- Run: npm run import-radicals
-- This will import the complete set of Chinese radicals with pinyin and definitions
-- 
-- =============================================

-- =============================================
-- 3. SEED WORDS (Sample - Common Words)
-- =============================================
-- 
-- NOTE: Chinese words are imported separately using the CC-CEDICT dictionary
-- Run: npm run import-cedict
-- This will import 3000+ Chinese words with pinyin and definitions
-- 
-- Below are sample words for other languages only
-- =============================================

INSERT INTO "Word" ("id", "languageCode", "word", "frequency", "level", "metadata", "createdAt", "updatedAt")
VALUES 
    -- English words
    ('word_en_001', 'en', 'learn', 10000, 'A1', '{"phonetic": "/lɜːrn/", "meaning": {"vi": "học", "zh": "學習"}}', NOW(), NOW()),
    ('word_en_002', 'en', 'language', 9000, 'A2', '{"phonetic": "/ˈlæŋɡwɪdʒ/", "meaning": {"vi": "ngôn ngữ", "zh": "語言"}}', NOW(), NOW()),
    ('word_en_003', 'en', 'study', 9500, 'A1', '{"phonetic": "/ˈstʌdi/", "meaning": {"vi": "học tập", "zh": "學習"}}', NOW(), NOW()),
    
    -- Japanese words
    ('word_ja_001', 'ja', '勉強', 8000, 'N5', '{"romaji": "benkyou", "hiragana": "べんきょう", "meaning": {"vi": "học tập", "en": "study"}}', NOW(), NOW()),
    ('word_ja_002', 'ja', '日本語', 9000, 'N5', '{"romaji": "nihongo", "hiragana": "にほんご", "meaning": {"vi": "tiếng Nhật", "en": "Japanese language"}}', NOW(), NOW()),
    
    -- Korean words
    ('word_ko_001', 'ko', '공부', 8000, 'TOPIK1', '{"romanization": "gongbu", "meaning": {"vi": "học tập", "en": "study"}}', NOW(), NOW()),
    ('word_ko_002', 'ko', '한국어', 8500, 'TOPIK1', '{"romanization": "hangugeo", "meaning": {"vi": "tiếng Hàn", "en": "Korean language"}}', NOW(), NOW())
ON CONFLICT ("word") DO NOTHING;

-- =============================================
-- 4. SEED WORD-RADICAL RELATIONSHIPS
-- =============================================
-- 
-- NOTE: Word-Radical relationships for Chinese characters can be added
-- after importing the CC-CEDICT dictionary using a separate script
-- For now, we skip this section
-- =============================================

-- No word-radical relationships seeded yet
-- TODO: Create a script to analyze Chinese characters and link to radicals

-- =============================================
-- 5. SEED DECKS (Sample Decks)
-- =============================================

INSERT INTO "Deck" ("id", "userId", "name", "description", "languageCode", "isPublic", "cardCount", "createdAt", "updatedAt")
VALUES 
    ('deck_001', 'user_001', 'HSK 1 Vocabulary', 'Essential HSK Level 1 words', 'zh-TW', true, 3, NOW(), NOW()),
    ('deck_en_001', 'user_001', 'Common English Words', 'Most frequently used English words', 'en', true, 3, NOW(), NOW()),
    ('deck_ja_001', 'user_001', 'Common Japanese Words', 'Most frequently used Japanese words', 'ja', true, 2, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- =============================================
-- 6. SEED DECK WORDS
-- =============================================

INSERT INTO "DeckWord" ("id", "deckId", "wordId", "position", "createdAt", "updatedAt")
VALUES 
    -- HSK 1 Deck
    ('dw_en_001', 'deck_en_001', 'word_en_001', 1, NOW(), NOW()),
    ('dw_en_002', 'deck_en_001', 'word_en_002', 2, NOW(), NOW()),
    ('dw_en_003', 'deck_en_001', 'word_en_003', 3, NOW(), NOW()),
    
    -- Japanese Deck
    ('dw_ja_001', 'deck_ja_001', 'word_ja_001', 1, NOW(), NOW()),
    ('dw_ja_002', 'deck_ja_001', 'word_ja_002', 2, NOW(), NOW())
ON CONFLICT ("deckId", "wordId") DO NOTHING;

-- =============================================
-- 7. SEED USER WORDS (Sample Progress)
-- =============================================

INSERT INTO "UserWord" ("id", "userId", "wordId", "progress", "streak", "nextReview", "efactor", "createdAt", "updatedAt")
VALUES 
    -- User studying some words
    ('uw_001', 'user_001', 'word_en_001', 0.5, 3, NOW() + INTERVAL '1 day', 2.6, NOW(), NOW()),
    ('uw_002', 'user_001', 'word_en_003', 0.8, 7, NOW() + INTERVAL '3 days', 2.8, NOW(), NOW()),
    ('uw_003', 'user_001', 'word_ja_001', 0.3, 1, NOW(), 2.5, NOW(), NOW())

ON CONFLICT ("userId", "wordId") DO NOTHING;

DO $$
DECLARE
    user_count INTEGER;
    radical_count INTEGER;
    word_count INTEGER;
    deck_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM "User";
    SELECT COUNT(*) INTO radical_count FROM "Radical";
    SELECT COUNT(*) INTO word_count FROM "Word";
    SELECT COUNT(*) INTO deck_count FROM "Deck";
    
    RAISE NOTICE 'Database seeded successfully!';
    RAISE NOTICE 'Users: %', user_count;
    RAISE NOTICE 'Radicals: %', radical_count;
    RAISE NOTICE 'Words: %', word_count;
    RAISE NOTICE 'Decks: %', deck_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Login credentials:';
    RAISE NOTICE '  Admin: admin@wxlingua.com / admin123';
    RAISE NOTICE '  User:  user@example.com / admin123';
END $$;
