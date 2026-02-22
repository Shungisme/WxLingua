# Database Documentation

## Overview

WxLingua uses **PostgreSQL 16** as the primary database, managed through **Prisma ORM** for type-safe database access.

## Database Schema

### Entity Relationship Diagram

```
┌────────────┐                ┌────────────┐
│    User    │                │    Word    │
└─────┬──────┘                └──────┬─────┘
      │                              │
      │ 1:N                          │ N:M
      ▼                              ▼
┌────────────┐                ┌────────────┐
│  UserWord  │                │WordRadical │
│ (SRS Data) │                │            │
└────────────┘                └──────┬─────┘
      │                              │
      │                              │ N:1
      │ N:1                          ▼
┌─────▼──────┐                ┌────────────┐
│    Deck    │◄───────────────┤  Radical   │
└─────┬──────┘     N:1        └────────────┘
      │
      │ N:M
      ▼
┌────────────┐
│  DeckWord  │
└────────────┘
```

## Models

### User

Stores user authentication and profile information.

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hash
  name      String?
  avatar    String?
  role      Role     @default(USER)

  words     UserWord[]
  decks     Deck[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

**Indexes:**

- Primary: `id` (CUID)
- Unique: `email`

**Fields:**

- `password`: bcrypt hash with cost factor 10
- `role`: USER or ADMIN for access control
- `avatar`: URL to profile image (optional)

### Word

Multi-language vocabulary entries.

```prisma
model Word {
  id            String        @id @default(cuid())
  languageCode  String        // ISO 639-1: zh-TW, en, ja, ko
  word          String        @unique
  frequency     Int?          // 1-1000+ (higher = more common)
  level         String?       // HSK1-6, JLPT N5-N1, CEFR A1-C2

  // Language-specific metadata (JSON)
  metadata      Json?

  // Audio pronunciation URL
  audioUrl      String?

  // Relations
  wordRadicals  WordRadical[]
  userWords     UserWord[]
  deckWords     DeckWord[]

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([languageCode])
  @@index([word])
  @@index([frequency])
}
```

**Indexes:**

- Primary: `id`
- Unique: `word`
- Index: `languageCode`, `word`, `frequency`

**Metadata Structure (JSON):**

**Chinese (zh-TW):**

```json
{
  "pinyin": "xué",
  "traditional": "學",
  "simplified": "学",
  "meanings": ["learn", "study", "school"],
  "examples": ["學習 (study)", "學校 (school)"]
}
```

**English:**

```json
{
  "phonetic": "/lɜːrn/",
  "partOfSpeech": "verb",
  "definitions": ["to gain knowledge"],
  "synonyms": ["study", "acquire knowledge"]
}
```

**Japanese:**

```json
{
  "hiragana": "まなぶ",
  "romaji": "manabu",
  "kanji": "学ぶ",
  "meanings": ["to learn", "to study"]
}
```

**Korean:**

```json
{
  "hangul": "배우다",
  "romanization": "baeuda",
  "meanings": ["to learn"]
}
```

### Radical

Chinese character components (214 Kangxi + extended).

```prisma
model Radical {
  id          String   @id @default(cuid())
  char        String   @unique  // '氵', '木', '口', '宀'
  variant     String   // 'traditional', 'simplified', 'both'
  strokeCount Int      // 1-17
  meaning     Json     // Multi-language meanings
  imageUrl    String?  // Stroke diagram SVG/PNG
  frequency   Int      // Usage count in words

  words       WordRadical[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([strokeCount])
}
```

**Meaning Structure (JSON):**

```json
{
  "vi": "nước",
  "en": "water",
  "zh": "氵部",
  "ja": "水",
  "ko": "물"
}
```

### WordRadical

Many-to-many relationship between Words and Radicals.

```prisma
model WordRadical {
  id        String @id @default(cuid())
  wordId    String
  radicalId String
  position  Int    @default(0)  // Order: Left->Right, Top->Bottom

  word     Word     @relation(fields: [wordId], references: [id], onDelete: Cascade)
  radical  Radical  @relation(fields: [radicalId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([wordId, radicalId])
}
```

**Position Convention:**

```
0: Left
1: Right
2: Top
3: Bottom
4: Surrounding
5: Inside
```

### Deck

User-created flashcard collections.

```prisma
model Deck {
  id           String     @id @default(cuid())
  name         String
  description  String?
  visibility   Visibility @default(PRIVATE)
  languageCode String     // Target language

  userId       String
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  deckWords    DeckWord[]

  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@index([userId])
  @@index([visibility])
}

enum Visibility {
  PUBLIC
  PRIVATE
}
```

### DeckWord

Many-to-many relationship between Decks and Words.

```prisma
model DeckWord {
  id        String   @id @default(cuid())
  deckId    String
  wordId    String

  deck      Deck     @relation(fields: [deckId], references: [id], onDelete: Cascade)
  word      Word     @relation(fields: [wordId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([deckId, wordId])
}
```

### UserWord

Spaced Repetition System (SRS) data for each user-word pair.

```prisma
model UserWord {
  id           String       @id @default(cuid())
  userId       String
  wordId       String

  // SuperMemo-2 Algorithm Parameters
  easeFactor   Float        @default(2.5)   // 1.3 - 2.5+
  interval     Int          @default(0)     // Days until next review
  repetitions  Int          @default(0)     // Consecutive correct answers
  nextReview   DateTime     @default(now()) // Next review date

  // Progress tracking
  masteryLevel MasteryLevel @default(NEW)
  totalReviews Int          @default(0)
  correctCount Int          @default(0)

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  word         Word         @relation(fields: [wordId], references: [id], onDelete: Cascade)

  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@unique([userId, wordId])
  @@index([userId, nextReview])
}

enum MasteryLevel {
  NEW        // Never studied
  LEARNING   // In learning phase
  YOUNG      // Recently learned
  MATURE     // Well established
  MASTER     // Fully mastered
}
```

**SuperMemo-2 Algorithm:**

```typescript
function calculateNextReview(quality: number, current: SRSData): SRSData {
  let { easeFactor, interval, repetitions } = current;

  // Update ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  // Update interval based on quality
  if (quality < 3) {
    // Incorrect: restart
    repetitions = 0;
    interval = 0;
  } else {
    // Correct: increase interval
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { easeFactor, interval, repetitions, nextReview };
}
```

**Quality Ratings:**

- `0`: Complete blackout, didn't remember at all
- `1`: Incorrect response, but remembered upon seeing answer
- `2`: Incorrect response, but seemed easy to recall
- `3`: Correct response, but required significant effort
- `4`: Correct response, with some hesitation
- `5`: Perfect response, instant recall

## Database Operations

### Common Queries

#### Get Due Words for Study

```typescript
const dueWords = await prisma.userWord.findMany({
  where: {
    userId: userId,
    nextReview: {
      lte: new Date(),
    },
  },
  include: {
    word: {
      include: {
        wordRadicals: {
          include: {
            radical: true,
          },
        },
      },
    },
  },
  orderBy: {
    nextReview: "asc",
  },
  take: 20,
});
```

#### Get Words by Radical

```typescript
const words = await prisma.word.findMany({
  where: {
    wordRadicals: {
      some: {
        radicalId: radicalId,
      },
    },
  },
  include: {
    wordRadicals: {
      include: {
        radical: true,
      },
      orderBy: {
        position: "asc",
      },
    },
  },
});
```

#### Get Deck Statistics

```typescript
const stats = await prisma.deck.findUnique({
  where: { id: deckId },
  include: {
    _count: {
      select: {
        deckWords: true,
      },
    },
    deckWords: {
      include: {
        word: {
          include: {
            userWords: {
              where: { userId: userId },
            },
          },
        },
      },
    },
  },
});
```

## Migrations

### Creating Migrations

```bash
# Create a new migration
npx prisma migrate dev --name add_user_avatar

# Apply migrations
npx prisma migrate deploy

# Reset database (development only!)
npx prisma migrate reset
```

### Migration Best Practices

1. **Never edit existing migrations** in production
2. **Test migrations** on a copy of production data
3. **Backup database** before applying migrations
4. **Use transactions** for complex migrations
5. **Plan for rollback** scenarios

### Example Migration

```sql
-- Create index for faster queries
CREATE INDEX idx_userword_nextreview ON "UserWord"("userId", "nextReview");

-- Add new column with default
ALTER TABLE "Word" ADD COLUMN "difficulty" INTEGER DEFAULT 1;

-- Migrate data
UPDATE "Word" SET "difficulty" =
  CASE
    WHEN "level" LIKE 'HSK%' THEN CAST(SUBSTRING("level" FROM 4) AS INTEGER)
    ELSE 1
  END;
```

## Performance Optimization

### Indexes

Critical indexes for performance:

```prisma
@@index([languageCode])           // Filter by language
@@index([userId, nextReview])     // Due cards query
@@index([visibility])             // Public decks
@@index([frequency])              // Popular words
```

### Query Optimization

**Bad:**

```typescript
// N+1 query problem
const decks = await prisma.deck.findMany();
for (const deck of decks) {
  const words = await prisma.deckWord.findMany({
    where: { deckId: deck.id },
  });
}
```

**Good:**

```typescript
// Single query with includes
const decks = await prisma.deck.findMany({
  include: {
    deckWords: {
      include: {
        word: true,
      },
    },
  },
});
```

### Connection Pooling

Prisma automatically manages connection pooling:

```
DATABASE_URL="postgresql://user:pass@localhost:5432/db?connection_limit=10"
```

## Backup & Recovery

### Automated Backups

```bash
#!/bin/bash
# backup-db.sh

docker-compose exec -T postgres pg_dump -U postgres wxlingua | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore

```bash
gunzip backup_20260222.sql.gz
docker-compose exec -T postgres psql -U postgres wxlingua < backup_20260222.sql
```

### Point-in-Time Recovery

Enable WAL archiving for point-in-time recovery (production):

```yaml
# docker-compose.yml
postgres:
  command: >
    postgres
    -c wal_level=replica
    -c archive_mode=on
    -c archive_command='cp %p /var/lib/postgresql/wal_archive/%f'
```

## Monitoring

### Key Metrics

- Connection pool usage
- Query performance
- Table sizes
- Index usage
- Lock conflicts

### Useful Queries

**Active connections:**

```sql
SELECT count(*) FROM pg_stat_activity;
```

**Slow queries:**

```sql
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Table sizes:**

```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Seeding

### Seed Data

The `prisma/seed.ts` script populates:

- Sample users
- 214 Kangxi radicals
- Common vocabulary (HSK, JLPT)
- Example decks

**Run seeding:**

```bash
npx prisma db seed
```

### Custom Seed Data

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@wxlingua.com",
      password: await hash("admin123"),
      name: "Admin",
      role: "ADMIN",
    },
  });

  // Create radicals
  const radicals = await prisma.radical.createMany({
    data: radicalData, // Import from JSON
  });

  // Create words
  const words = await prisma.word.createMany({
    data: wordData,
  });
}

main();
```

## Security

### Data Protection

- **Password hashing**: bcrypt with cost factor 10
- **SQL injection**: Prevented by Prisma (parameterized queries)
- **Access control**: Row-level security (RLS) planned
- **Encryption**: PostgreSQL SSL in production

### Sensitive Data

Never commit:

- Production DATABASE_URL
- User passwords (plain text)
- API keys in migrations

## Troubleshooting

### Connection Issues

```bash
# Test connection
docker-compose exec postgres psql -U postgres -d wxlingua

# Check logs
docker-compose logs postgres
```

### Migration Errors

```bash
# Check migration status
npx prisma migrate status

# Resolve conflicts
npx prisma migrate resolve --applied "migration_name"
```

### Performance Issues

```bash
# Analyze queries
EXPLAIN ANALYZE SELECT ...;

# Check indexes
\d table_name
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SuperMemo-2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
