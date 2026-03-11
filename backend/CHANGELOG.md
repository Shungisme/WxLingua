# Changelog

All notable changes to the WxLingua Backend API will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- GraphQL API support
- WebSocket for real-time study sessions
- Advanced analytics and study statistics
- Social features (follow users, share decks)
- AI-powered word suggestions
- Character decomposition algorithm for WordRadical relationships

## [0.0.2] - 2026-03-11

### Added

- **FSRS Spaced Repetition Algorithm**
  - Replaced SuperMemo-2 with Free Spaced Repetition Scheduler (FSRS)
  - New `CardState` enum: `NEW`, `LEARNING`, `REVIEW`, `RELEARNING`
  - Per-card `stability`, `difficulty`, `lapses`, `state`, `lastReview` fields on `UserWord`
  - `ReviewLog` model for per-review history (supports undo & statistics)
  - `PasswordResetToken` model for password reset flow
  - Ratings scale changed from 0–5 (SM-2) to 1–4 (Again / Hard / Good / Easy)

- **DeckCard Model** (replaces `DeckWord` join table)
  - Each card inside a deck now has user-customizable content: `term`, `meaning`, `pronunciation`, `imageUrl`, `audioUrl`, `notes`, `position`
  - Per-card FSRS scheduling state stored inline inside `DeckCard`
  - Optional `sourceWordId` to link back to the dictionary `Word`
  - Composite unique constraint on `(deckId, term)` to prevent duplicates
  - Migration drops old `DeckWord` table and creates `DeckCard`

- **Study Mode Parameter** (`GET /study/next?mode=learn|review`)
  - `mode=learn` returns all cards in the deck ordered by position — no SRS gate
  - `mode=review` returns only cards where `nextReview ≤ now` (due cards only)
  - Defaults to `review` for backward compatibility
  - Swagger docs updated with `mode` enum query param

- **Due Count in Deck List** (`GET /decks`)
  - Each deck in the user's deck list now includes `dueCount: number`
  - Counts `DeckCard` rows where `nextReview ≤ now` via filtered Prisma `_count`
  - Enables frontend to show per-deck review badges without extra API calls

- **Automated Database Setup**
  - Enhanced `npm run setup-db` to automatically import radicals and dictionary
  - Single command now completes full database initialization
  - Imports 214 Kangxi radicals after schema creation
  - Imports **ALL 124,293 CC-CEDICT entries** with pinyin conversion (no limit)
  - Progress tracking for all 5 setup steps
  - No manual import commands needed for initial setup

- **Dictionary Module**
  - Public dictionary search API (`/api/dictionary/search`)
  - Multi-type search support (character, pinyin, meaning, all)
  - Word detail endpoint (`/api/dictionary/word/:id`)
  - Radical lookup endpoint (`/api/dictionary/radical/:char`)
  - List all radicals endpoint (`/api/dictionary/radicals`)
  - JSONB-based metadata querying for flexible search
  - No authentication required for dictionary endpoints

- **CC-CEDICT Dictionary Import**
  - Full CC-CEDICT parser (124,293 Traditional Chinese entries)
  - Batch import system (500 entries/batch for optimal performance)
  - Automatic duplicate detection and skipping
  - Progress tracking with real-time percentage display
  - Support for Traditional and Simplified characters
  - Pinyin pronunciation with tone marks
  - English definitions as JSONB array
  - MD5-based unique ID generation (`zh_` + hash)
  - Import command: `npm run import-cedict` with `--limit` option

- **214 Kangxi Radicals Import**
  - Complete set of 214 Kangxi radicals with metadata
  - Pinyin pronunciation for each radical
  - English definitions
  - Variant forms (e.g., "氵" for "水", "亻" for "人")
  - Stroke count information
  - Frequency ranking
  - Import command: `npm run import-radicals`

- **Pinyin Tone Converter Utility**
  - Convert numbered pinyin to tone-marked pinyin
  - Support for all 4 tones plus neutral tone
  - Handles special cases (iu, ui vowel combinations)
  - Colon notation support (u:4 → ǚ, nu:3 → nǚ)
  - Intelligent numbered pinyin detection
  - Reusable utility for all pinyin processing
  - Full test suite with 13+ test cases

- **Database Setup Enhancements**
  - Auto-create database if not exists feature
  - Enhanced `setup-db.ts` with database existence check
  - Connects to 'postgres' database to create target DB
  - Safer initialization workflow

- **Authentication Improvements**
  - Custom `JwtAuthGuard` extending Passport JWT guard
  - `@Public()` decorator for public endpoints
  - Reflection-based public endpoint detection
  - Selective authentication per endpoint
  - Public access for GET endpoints in DecksController
  - Enables Server-Side Rendering in Next.js frontend

- **Integrated Seed System**
  - Comprehensive `prisma/seed.ts` script
  - Automatically imports radicals and dictionary
  - Automatic pinyin tone conversion during import
  - Checks for existing data to avoid duplicates
  - Single command seeding: `npx prisma db seed`

- **npm Scripts**
  - `npm run import-cedict` - Import Chinese dictionary
  - `npm run import-radicals` - Import Kangxi radicals
  - `npm run update-pinyin` - Migrate pinyin tones (legacy, now integrated)

### Changed

- **Study Service** (`getNextCards`)
  - Signature updated: `getNextCards(userId, deckId?, limit?, mode?)`
  - `mode=learn` replaces the old behaviour of mixing due + NEW cards
  - `mode=review` replaces the old due-only path (no NEW card back-fill)

- **Decks Service** (`findAll`)
  - User deck list query now uses `include._count` with a filtered `where` clause
  - Returns enriched deck objects with `dueCount` field

- **Decks Module**
  - DecksController now uses custom `JwtAuthGuard` instead of default AuthGuard
  - `findAll()` and `getById()` marked as public with `@Public()` decorator
  - `DecksService.findAll()` accepts optional userId parameter
  - Public decks now accessible without authentication

- **Database Setup Process**
  - `setup-db.ts` now calls `importRadicals()` and `importCedict(0)` automatically
  - `importCedict()` accepts optional `limitOverride` parameter for programmatic usage
  - Import functions refactored to be callable programmatically
  - Added `require.main === module` pattern to all import scripts
  - Better error handling and progress reporting
  - Setup now imports complete dictionary (124k+ words) instead of limited subset

- **Import Process**
  - `import-cedict.ts` now automatically converts pinyin tones during import
  - Post-import pinyin conversion step for existing records
  - Improved numbered pinyin detection with `hasNumberedPinyin()` function
  - Import script scans and updates all existing Chinese words

- **Seed Data**
  - `seed-tables.sql` updated to reference new import scripts
  - Removed hardcoded Chinese word samples (now use CC-CEDICT)
  - Removed hardcoded radical samples (now use Kangxi import)
  - Added instructional comments for import commands

### Fixed

- **Pinyin Processing**
  - Fixed CRLF vs LF line ending issue in CEDICT parser
  - Improved regex to handle both Windows and Unix line endings
  - Proper handling of ü (u:, v:) in pinyin syllables
  - Edge case handling for words like "4S店" (mixed alphanumeric)

- **Database Initialization**
  - Fixed "database does not exist" error on fresh installations
  - Ensured database creation before running migrations
  - Better error messages for database connection issues

- **API Access**
  - Fixed 401 Unauthorized error on public deck listing
  - Resolved authentication issues with Next.js Server Components
  - Public endpoints now properly bypass JWT validation

### Performance

- Batch insert optimization (500 words/batch)
- JSONB indexing for fast metadata queries
- Efficient duplicate checking using `skipDuplicates: true`
- Progress indicators for long-running imports
- Import performance: ~1 second for 3,000 words

### Documentation

- Added comprehensive comments to all import scripts
- Documented pinyin conversion algorithms
- Inline documentation for tone placement rules
- Usage examples in script headers

### Technical

- **File Structure**
  - `database/parsers/cedict-parser.ts` - CEDICT format parser
  - `database/import-cedict.ts` - Dictionary import script
  - `database/import-radicals.ts` - Radicals import script
  - `database/utils/pinyin-converter.ts` - Pinyin tone converter
  - `database/update-pinyin.ts` - Migration script for pinyin tones
  - `src/dictionary/` - Dictionary module (controller, service, DTOs)
  - `src/common/decorators/public.decorator.ts` - Public endpoint marker
  - `src/auth/jwt-auth.guard.ts` - Custom JWT guard with public support

- **Database Schema**
  - Word metadata stored as JSONB for flexibility
  - Radical `char` field has unique constraint
  - Support for Traditional Chinese (zh-TW) language code
  - **NEW** `ReviewLog` table for per-review history (undo & statistics)
  - **NEW** `PasswordResetToken` table for password reset flow
  - **NEW** `DeckCard` table replaces `DeckWord` — per-card SRS state + user-customizable content
  - **NEW** `CardState` enum: `NEW`, `LEARNING`, `REVIEW`, `RELEARNING`
  - **UPDATED** `UserWord` — added FSRS fields: `stability`, `difficulty`, `lapses`, `state`, `lastReview`
  - Prisma migrations: `20260309101928_init`, `20260309114144_add_deck_card_model`

### Breaking Changes

- `DeckWord` table dropped — replaced by `DeckCard`; existing deck associations must be migrated
- SRS rating scale changed: 0–5 (SM-2) → 1–4 (FSRS: Again/Hard/Good/Easy)
- `MasteryLevel` enum replaced by `CardState` enum in `UserWord`

### Migration Notes

- **Fresh install**: Run `npm run setup-db` — handles everything automatically
- **From v0.0.1**: Apply Prisma migrations, then run `npm run import-cedict` and `npm run import-radicals`
- Pinyin conversion is now automatic during import
- Old `update-pinyin` script kept for manual migration if needed

## [0.0.1] - 2026-02-22

### Added

- **Authentication Module**
  - JWT-based authentication with Passport
  - User registration and login endpoints
  - Password hashing with bcrypt
  - Role-based access control (USER, ADMIN)

- **Radicals Module**
  - Support for 214 Kangxi radicals
  - Extended radical variants (traditional, simplified)
  - Radical metadata with multi-language meanings
  - Stroke count and frequency tracking

- **Words Module**
  - Multi-language word support (zh-TW, en, ja, ko)
  - Language-specific metadata (pinyin, phonetics)
  - Word frequency and level classification
  - Audio pronunciation support
  - Radical decomposition for Chinese characters

- **Decks Module**
  - Create custom flashcard decks
  - Public and private deck visibility
  - Add/remove words from decks
  - Deck statistics and progress tracking

- **Study Module**
  - Spaced Repetition System (SRS) using SuperMemo-2 algorithm
  - Study session management
  - Progress tracking with quality ratings (0-5)
  - Next review date calculation
  - Mastery level tracking

- **Upload Module**
  - Audio file upload for word pronunciations
  - Multer configuration with file validation
  - Local storage (S3-ready architecture)

- **Database**
  - Prisma ORM integration
  - PostgreSQL database
  - Redis caching layer
  - Database seeding script

- **API Documentation**
  - Swagger/OpenAPI documentation at `/api/docs`
  - DTO validation with class-validator
  - Request/response examples

- **Security**
  - Helmet.js for HTTP headers
  - CORS configuration
  - Input validation pipes
  - Language validation for multi-language support

- **DevOps**
  - Docker support with multi-stage builds
  - Docker Compose for local development
  - Environment variable configuration
  - Production-ready setup

### Security

- Implemented JWT secret key authentication
- Added password hashing with bcrypt (cost factor: 10)
- Enabled CORS with configurable origins
- Added Helmet.js security headers
- Input sanitization and validation on all endpoints

### Documentation

- API documentation with Swagger
- Database schema documentation
- Setup and deployment guides
- Environment configuration examples

## [0.0.0] - Initial Setup

### Added

- Project scaffolding with NestJS CLI
- Basic project structure
- ESLint and Prettier configuration
- TypeScript configuration
- Testing setup with Jest

---

## Version History

- **0.0.2** - FSRS algorithm, DeckCard model, Dictionary system, Study modes, Due count, Full CC-CEDICT import
- **0.0.1** - Initial production-ready release with core features
- **0.0.0** - Project initialization

## Migration Guide

No migrations required for initial version.

## Contributors

- Development Team - Initial work

## License

UNLICENSED - Private project
