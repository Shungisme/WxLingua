# Database Guidelines

## Prisma Best Practices for WxLingua

### Schema Design

**Model Naming:**

- Use **PascalCase** for model names
- Use **camelCase** for field names
- Use descriptive names

**Example:**

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  role      Role     @default(USER)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Field Types

**Choose appropriate types:**

```prisma
model Word {
  id            String   @id @default(cuid())  // Primary key
  word          String   @unique               // Unique constraint
  languageCode  String                         // Required string
  frequency     Int?                           // Optional integer
  level         String?                        // Optional string
  metadata      Json?                          // JSON field
  audioUrl      String?                        // Optional URL

  createdAt     DateTime @default(now())       // Auto timestamp
  updatedAt     DateTime @updatedAt            // Auto update
}
```

### Relationships

**One-to-Many:**

```prisma
model User {
  id    String @id @default(cuid())
  decks Deck[] // One user has many decks
}

model Deck {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Many-to-Many:**

```prisma
model Deck {
  id        String     @id @default(cuid())
  deckWords DeckWord[] // Join table
}

model Word {
  id        String     @id @default(cuid())
  deckWords DeckWord[] // Join table
}

model DeckWord {
  id     String @id @default(cuid())
  deckId String
  wordId String

  deck   Deck   @relation(fields: [deckId], references: [id], onDelete: Cascade)
  word   Word   @relation(fields: [wordId], references: [id], onDelete: Cascade)

  @@unique([deckId, wordId]) // Prevent duplicates
}
```

### Indexes

**Add indexes for frequently queried fields:**

```prisma
model Word {
  id           String @id @default(cuid())
  word         String @unique
  languageCode String
  frequency    Int?

  @@index([languageCode])        // Filter by language
  @@index([frequency])           // Sort by frequency
  @@index([word])                // Search by word
}

model UserWord {
  userId     String
  wordId     String
  nextReview DateTime

  @@unique([userId, wordId])
  @@index([userId, nextReview])  // Query due cards
}
```

### Migrations

**Creating Migrations:**

```bash
# Create migration
npx prisma migrate dev --name add_user_avatar

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only!)
npx prisma migrate reset
```

**Migration Best Practices:**

1. **Never edit existing migrations**
2. **Test on development first**
3. **Backup before running** in production
4. **Use descriptive names**
5. **Keep migrations small**

**Adding a Column:**

```bash
# 1. Update schema.prisma
model User {
  avatar String? // Add new field
}

# 2. Create migration
npx prisma migrate dev --name add_user_avatar

# 3. Migration file is auto-generated
```

**Data Migration Example:**

```prisma
// If you need custom SQL in migration:
-- migration.sql
ALTER TABLE "User" ADD COLUMN "avatar" TEXT;

-- Migrate existing data
UPDATE "User"
SET "avatar" = '/default-avatar.png'
WHERE "avatar" IS NULL;
```

### Query Optimization

**Use `select` to limit fields:**

```typescript
// ❌ Bad - Returns all fields
const words = await prisma.word.findMany();

// ✅ Good - Returns only needed fields
const words = await prisma.word.findMany({
  select: {
    id: true,
    word: true,
    languageCode: true,
  },
});
```

**Use `include` efficiently:**

```typescript
// ✅ Good - Include related data in one query
const word = await prisma.word.findUnique({
  where: { id },
  include: {
    wordRadicals: {
      include: {
        radical: true,
      },
    },
  },
});

// ❌ Bad - N+1 query problem
const words = await prisma.word.findMany();
for (const word of words) {
  const radicals = await prisma.wordRadical.findMany({
    where: { wordId: word.id },
  });
}
```

**Pagination:**

```typescript
async function getWords(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.word.findMany({
      skip,
      take: limit,
      orderBy: { frequency: "desc" },
    }),
    prisma.word.count(),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

### Transactions

**Use for atomic operations:**

```typescript
// ✅ Transaction ensures all-or-nothing
await prisma.$transaction(async (tx) => {
  // Create deck
  const deck = await tx.deck.create({
    data: {
      name: "My Deck",
      userId: userId,
    },
  });

  // Add words to deck
  await tx.deckWord.createMany({
    data: wordIds.map((wordId) => ({
      deckId: deck.id,
      wordId,
    })),
  });
});

// If any operation fails, all are rolled back
```

### Error Handling

**Handle Prisma errors:**

```typescript
try {
  const word = await prisma.word.create({
    data: createWordDto,
  });
  return word;
} catch (error) {
  // Unique constraint violation
  if (error.code === "P2002") {
    throw new ConflictException("Word already exists");
  }

  // Foreign key constraint violation
  if (error.code === "P2003") {
    throw new BadRequestException("Invalid reference");
  }

  // Record not found
  if (error.code === "P2025") {
    throw new NotFoundException("Record not found");
  }

  throw error;
}
```

**Common Prisma Error Codes:**

- `P2002`: Unique constraint violation
- `P2003`: Foreign key constraint violation
- `P2025`: Record not found
- `P2014`: Relation violation

### Seeding

**Create seed data:**

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@wxlingua.com" },
    update: {},
    create: {
      email: "admin@wxlingua.com",
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log("Created admin:", admin.email);

  // Seed radicals
  const radicalsData = [
    { char: "氵", strokeCount: 3, meaning: { en: "water", vi: "nước" } },
    { char: "木", strokeCount: 4, meaning: { en: "tree", vi: "cây" } },
    // ... more radicals
  ];

  for (const radical of radicalsData) {
    await prisma.radical.upsert({
      where: { char: radical.char },
      update: {},
      create: radical,
    });
  }

  console.log(`Seeded ${radicalsData.length} radicals`);

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run seed:**

```bash
npx prisma db seed
```

### Connection Management

**Singleton Pattern:**

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    console.log("Prisma connected");
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log("Prisma disconnected");
  }
}
```

### Database Maintenance

**Analyze Performance:**

```sql
-- Check slow queries
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Check Index Usage:**

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

**Table Sizes:**

```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Prisma Studio

**Visual Database Editor:**

```bash
npx prisma studio
```

Opens GUI at http://localhost:5555 to:

- Browse data
- Edit records
- View relationships
- Test queries

## Checklist for Database Changes

- [ ] Update schema.prisma
- [ ] Run `npx prisma format`
- [ ] Create migration with descriptive name
- [ ] Test migration locally
- [ ] Update seed data if needed
- [ ] Add indexes for new queries
- [ ] Handle errors in services -[ ] Test rollback procedure
- [ ] Document breaking changes
- [ ] Backup production before deploying

---

**Follow these guidelines for efficient, safe database operations.**
