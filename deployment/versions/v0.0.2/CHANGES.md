# Version 0.0.2 Changes

**Release Date**: March 11, 2026  
**Type**: Feature Release  
**Previous Version**: v0.0.1

## Overview

Major feature release introducing the FSRS spaced repetition engine, DeckCard model,
full CC-CEDICT dictionary (124k+ words), dictionary search module, multiple study modes
(Learn / Review / Typing Practice / Matching Game), and a complete deck management UI.

---

## Backend Changes (NestJS)

### New: FSRS Spaced Repetition Algorithm

- Replaced SuperMemo-2 with **Free Spaced Repetition Scheduler (FSRS)**
- New `CardState` enum: `NEW`, `LEARNING`, `REVIEW`, `RELEARNING`
- Per-card FSRS fields on `UserWord`: `stability`, `difficulty`, `lapses`, `state`, `lastReview`
- `ReviewLog` table for full per-review history (enables undo & analytics)
- `PasswordResetToken` table for password reset flow
- Rating scale changed: 0–5 (SM-2) → 1–4 (Again / Hard / Good / Easy)

### New: DeckCard Model

- `DeckCard` table replaces `DeckWord` join table
- User-customizable card content: `term`, `meaning`, `pronunciation`, `imageUrl`, `audioUrl`, `notes`, `position`
- Per-card FSRS scheduling state stored inline
- Optional `sourceWordId` reference to the dictionary `Word`- Composite unique constraint `(deckId, term)` prevents duplicates

### New: Study Mode Parameter

- `GET /study/next?mode=learn|review`
- `mode=learn` — all cards ordered by position (no SRS gate)
- `mode=review` — due cards only (`nextReview ≤ now`)
- Defaults to `review` for backward compatibility

### New: Due Count in Deck List

- `GET /decks` now returns `dueCount` per deck
- Counts `DeckCard` rows where `nextReview ≤ now`

### New: Dictionary Module

- `GET /api/dictionary/search` — public dictionary search (character, pinyin, meaning)
- `GET /api/dictionary/word/:id` — word detail
- `GET /api/dictionary/radical/:char` — radical lookup
- `GET /api/dictionary/radicals` — list all radicals
- No authentication required

### New: CC-CEDICT Dictionary Import

- 124,293 Traditional Chinese entries
- Batch import (500/batch), duplicate detection, progress tracking
- `npm run import-cedict`

### New: 214 Kangxi Radicals Import

- Complete Kangxi radical set with metadata, pinyin, stroke count
- `npm run import-radicals`

### New: Pinyin Tone Converter

- Converts numbered pinyin → tone-marked pinyin (xue2 → xué)
- Handles ü (u:, v:), iu/ui combinations, neutral tone

### New: Authentication Improvements

- `@Public()` decorator for public endpoints
- Custom `JwtAuthGuard` with reflection-based public detection
- `GET /decks` and `GET /decks/:id` now publicly accessible

### New: Automated Database Setup

- `npm run setup-db` — single command completes full initialization
- Imports all 124k+ dictionary entries and 214 radicals automatically

### Changed

- `DecksService.findAll()` accepts optional `userId` parameter
- `StudyService.getNextCards()` signature: `(userId, deckId?, limit?, mode?)`
- Import functions callable programmatically (added `require.main === module` guard)

### Fixed

- CRLF/LF line ending issue in CEDICT parser
- ü (u:, v:) handling in pinyin syllables
- "database does not exist" error on fresh installations
- 401 Unauthorized on public deck listing

---

## Frontend Changes (Next.js)

### New: Dictionary

- Search 124,000+ Chinese words (character, pinyin, meaning)
- Autocomplete with 300ms debounce, keyboard navigation, 8 suggestions
- Text-to-Speech via Web Speech API (zh-CN, 0.8× rate)
- Tone-marked pinyin, traditional/simplified character display
- Navigation link in sidebar

### New: Study Mode Split (Learn vs Review)

- **Study** button → `mode=learn` (all cards, no SRS gate)
- **Review X** button → `mode=review` (due cards only)
- Page title and description adapt to current mode

### New: Typing Practice Mode (`mode=type`)

- Shows meaning; user types the word
- Pinyin/phonetic hint toggle
- Case-insensitive exact match, Skip button, Enter to advance
- Progress bar + correct/wrong running score

### New: Matching Game Mode (`mode=match`)

- 6-pair shuffled grid per round
- Green flash on match, red flash on mismatch (700ms)
- Automatic round advancement, reshuffle button
- Final score screen with total mistakes

### New: Deck Management

- Add-to-Deck from dictionary results (BookmarkPlus button)
- `CreateDeckDialog` with name/description/language/visibility
- `AddToDeckDialog` with deck selection
- Tabs: "My Decks" | "Public Decks"
- Accessible dialogs (Escape / click-outside close)

### New: Custom Hooks

- `useTextToSpeech` — Web Speech API wrapper with cleanup
- `useDebounce<T>` — generic configurable debounce

---

## Database Migrations

Two Prisma migrations applied (dated 2026-03-09):

| Migration                            | Description                                                                       |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| `20260309101928_init`                | Full schema with FSRS fields, `ReviewLog`, `PasswordResetToken`, `CardState` enum |
| `20260309114144_add_deck_card_model` | Drop `DeckWord`, create `DeckCard`                                                |

See `migration.sql` in this folder for the combined SQL.

---

## Breaking Changes

| Area        | Change                                                      |
| ----------- | ----------------------------------------------------------- |
| Database    | `DeckWord` table dropped → replaced by `DeckCard`           |
| SRS ratings | 0–5 (SM-2) → 1–4 (FSRS Again/Hard/Good/Easy)                |
| SRS enum    | `MasteryLevel` replaced by `CardState`                      |
| Study API   | `mode` query param required for explicit learn/review paths |

---

## Upgrade from v0.0.1

See `deployment-notes.md` for step-by-step upgrade instructions.

---

## Known Issues

- Audio playback may require user interaction on mobile browsers
- Safari CSS animation compatibility in Matching Game

---

## Dependencies

### Backend

- NestJS 11.x
- Prisma 6.x
- PostgreSQL 16
- Redis 7

### Frontend

- Next.js 15.x
- React 19.x
- TanStack Query 5.x
- Tailwind CSS 4.x
