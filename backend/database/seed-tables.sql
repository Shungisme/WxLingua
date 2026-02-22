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
-- 2. SEED RADICALS (Sample - Common Radicals)
-- =============================================

INSERT INTO "Radical" ("id", "char", "variant", "strokeCount", "meaning", "frequency", "createdAt", "updatedAt")
VALUES 
    -- Water radical
    ('rad_001', '氵', 'phồn thể', 3, '{"vi": "nước", "en": "water", "zh": "水部"}', 1000, NOW(), NOW()),
    
    -- Tree/Wood radical
    ('rad_002', '木', 'chung', 4, '{"vi": "cây", "en": "tree/wood", "zh": "木部"}', 950, NOW(), NOW()),
    
    -- Mouth radical
    ('rad_003', '口', 'chung', 3, '{"vi": "miệng", "en": "mouth", "zh": "口部"}', 900, NOW(), NOW()),
    
    -- Heart radical
    ('rad_004', '心', 'phồn thể', 4, '{"vi": "tim", "en": "heart", "zh": "心部"}', 850, NOW(), NOW()),
    
    -- Hand radical
    ('rad_005', '手', 'chung', 4, '{"vi": "tay", "en": "hand", "zh": "手部"}', 800, NOW(), NOW()),
    
    -- Person radical
    ('rad_006', '亻', 'chung', 2, '{"vi": "người", "en": "person", "zh": "人部"}', 950, NOW(), NOW()),
    
    -- Grass radical
    ('rad_007', '艹', 'phồn thể', 3, '{"vi": "cỏ", "en": "grass", "zh": "草部"}', 700, NOW(), NOW()),
    
    -- Roof radical
    ('rad_008', '宀', 'chung', 3, '{"vi": "mái nhà", "en": "roof", "zh": "宀部"}', 650, NOW(), NOW()),
    
    -- Bamboo radical
    ('rad_009', '竹', 'chung', 6, '{"vi": "tre", "en": "bamboo", "zh": "竹部"}', 600, NOW(), NOW()),
    
    -- Fire radical
    ('rad_010', '火', 'chung', 4, '{"vi": "lửa", "en": "fire", "zh": "火部"}', 750, NOW(), NOW())
ON CONFLICT ("char") DO NOTHING;

-- =============================================
-- 3. SEED WORDS (Sample - Common Words)
-- =============================================

INSERT INTO "Word" ("id", "languageCode", "word", "frequency", "level", "metadata", "createdAt", "updatedAt")
VALUES 
    -- Traditional Chinese words
    ('word_001', 'zh-TW', '學習', 5000, 'HSK4', '{"pinyin": "xué xí", "meaning": {"vi": "học tập", "en": "to study/learn"}}', NOW(), NOW()),
    ('word_002', 'zh-TW', '語言', 4500, 'HSK4', '{"pinyin": "yǔ yán", "meaning": {"vi": "ngôn ngữ", "en": "language"}}', NOW(), NOW()),
    ('word_003', 'zh-TW', '學生', 5500, 'HSK1', '{"pinyin": "xué shēng", "meaning": {"vi": "học sinh", "en": "student"}}', NOW(), NOW()),
    ('word_004', 'zh-TW', '中文', 6000, 'HSK1', '{"pinyin": "zhōng wén", "meaning": {"vi": "tiếng Trung", "en": "Chinese language"}}', NOW(), NOW()),
    ('word_005', 'zh-TW', '漢字', 4000, 'HSK5', '{"pinyin": "hàn zì", "meaning": {"vi": "chữ Hán", "en": "Chinese character"}}', NOW(), NOW()),
    
    -- English words
    ('word_006', 'en', 'learn', 10000, 'A1', '{"phonetic": "/lɜːrn/", "meaning": {"vi": "học", "zh": "學習"}}', NOW(), NOW()),
    ('word_007', 'en', 'language', 9000, 'A2', '{"phonetic": "/ˈlæŋɡwɪdʒ/", "meaning": {"vi": "ngôn ngữ", "zh": "語言"}}', NOW(), NOW()),
    ('word_008', 'en', 'study', 9500, 'A1', '{"phonetic": "/ˈstʌdi/", "meaning": {"vi": "học tập", "zh": "學習"}}', NOW(), NOW()),
    
    -- Japanese words
    ('word_009', 'ja', '勉強', 8000, 'N5', '{"romaji": "benkyou", "hiragana": "べんきょう", "meaning": {"vi": "học tập", "en": "study"}}', NOW(), NOW()),
    ('word_010', 'ja', '日本語', 9000, 'N5', '{"romaji": "nihongo", "hiragana": "にほんご", "meaning": {"vi": "tiếng Nhật", "en": "Japanese language"}}', NOW(), NOW()),
    
    -- Korean words
    ('word_011', 'ko', '공부', 8000, 'TOPIK1', '{"romanization": "gongbu", "meaning": {"vi": "học tập", "en": "study"}}', NOW(), NOW()),
    ('word_012', 'ko', '한국어', 8500, 'TOPIK1', '{"romanization": "hangugeo", "meaning": {"vi": "tiếng Hàn", "en": "Korean language"}}', NOW(), NOW())
ON CONFLICT ("word") DO NOTHING;

-- =============================================
-- 4. SEED WORD-RADICAL RELATIONSHIPS
-- =============================================

-- 學習 = 學 (contains 子) + 習 (contains 羽)
-- Simplified example: Link common radicals
INSERT INTO "WordRadical" ("id", "wordId", "radicalId", "position", "createdAt", "updatedAt")
VALUES 
    ('wr_001', 'word_001', 'rad_006', 1, NOW(), NOW()), -- 學習 contains person radical
    ('wr_002', 'word_003', 'rad_006', 1, NOW(), NOW()), -- 學生 contains person radical
    ('wr_003', 'word_005', 'rad_003', 2, NOW(), NOW())  -- 漢字 contains mouth radical
ON CONFLICT ("wordId", "radicalId") DO NOTHING;

-- =============================================
-- 5. SEED DECKS (Sample Decks)
-- =============================================

INSERT INTO "Deck" ("id", "userId", "name", "description", "languageCode", "isPublic", "cardCount", "createdAt", "updatedAt")
VALUES 
    ('deck_001', 'user_001', 'HSK 1 Vocabulary', 'Essential HSK Level 1 words', 'zh-TW', true, 3, NOW(), NOW()),
    ('deck_002', 'user_001', 'Common English Words', 'Most frequently used English words', 'en', true, 3, NOW(), NOW()),
    ('deck_003', 'admin_001', 'JLPT N5 Basics', 'Japanese vocabulary for beginners', 'ja', true, 2, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =============================================
-- 6. SEED DECK WORDS
-- =============================================

INSERT INTO "DeckWord" ("id", "deckId", "wordId", "position", "createdAt", "updatedAt")
VALUES 
    -- HSK 1 Deck
    ('dw_001', 'deck_001', 'word_003', 1, NOW(), NOW()),
    ('dw_002', 'deck_001', 'word_004', 2, NOW(), NOW()),
    ('dw_003', 'deck_001', 'word_001', 3, NOW(), NOW()),
    
    -- English Deck
    ('dw_004', 'deck_002', 'word_006', 1, NOW(), NOW()),
    ('dw_005', 'deck_002', 'word_007', 2, NOW(), NOW()),
    ('dw_006', 'deck_002', 'word_008', 3, NOW(), NOW()),
    
    -- Japanese Deck
    ('dw_007', 'deck_003', 'word_009', 1, NOW(), NOW()),
    ('dw_008', 'deck_003', 'word_010', 2, NOW(), NOW())
ON CONFLICT ("deckId", "wordId") DO NOTHING;

-- =============================================
-- 7. SEED USER WORDS (Sample Progress)
-- =============================================

INSERT INTO "UserWord" ("id", "userId", "wordId", "progress", "streak", "nextReview", "efactor", "createdAt", "updatedAt")
VALUES 
    -- User studying some words
    ('uw_001', 'user_001', 'word_001', 0.5, 3, NOW() + INTERVAL '1 day', 2.6, NOW(), NOW()),
    ('uw_002', 'user_001', 'word_003', 0.8, 7, NOW() + INTERVAL '3 days', 2.8, NOW(), NOW()),
    ('uw_003', 'user_001', 'word_006', 0.3, 1, NOW(), 2.5, NOW(), NOW())
ON CONFLICT ("userId", "wordId") DO NOTHING;

-- =============================================
-- COMPLETE
-- =============================================

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
