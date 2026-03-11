# Deployment Notes for v0.0.2

**Release Date**: March 11, 2026  
**Type**: Feature Release  
**Upgrade from**: v0.0.1

---

## Pre-Deployment Checklist

- [ ] Full database backup completed (`./deployment/scripts/backup.sh production`)
- [ ] Staging deployment tested successfully
- [ ] All environment variables reviewed
- [ ] JWT_SECRET unchanged or communicated to all services
- [ ] Redis available and healthy
- [ ] Sufficient disk space for 124k+ word dictionary (~200MB DB growth)
- [ ] Confirmed maintenance window (dictionary import ~5 min)

---

## Breaking Changes

| Area          | v0.0.1                    | v0.0.2                                        |
| ------------- | ------------------------- | --------------------------------------------- |
| Deck cards    | `DeckWord` join table     | `DeckCard` with per-card SRS + custom content |
| SRS algorithm | SuperMemo-2 (ratings 0–5) | FSRS (ratings 1–4: Again/Hard/Good/Easy)      |
| SRS state     | `MasteryLevel` enum       | `CardState` enum                              |
| Study API     | No `mode` param           | `?mode=learn\|review`                         |

> **Important**: All existing `DeckWord` rows will be **deleted** by the migration.
> Users will need to re-add words to their decks after upgrading.
> Back up the `DeckWord` table if you need to preserve deck contents:
>
> ```sql
> COPY "DeckWord" TO '/tmp/deckword_backup.csv' DELIMITER ',' CSV HEADER;
> ```

---

## Upgrade Instructions

### 1. Backup Current Database

```bash
./deployment/scripts/backup.sh production
```

Verify backup:

```bash
ls -lh backups/
# Should see a recent .sql.gz file
```

### 2. Pull Latest Code

```bash
git checkout main
git pull origin main
```

### 3. Stop Application Services (keep DB & Redis running)

```bash
docker-compose -f deployment/docker-compose.prod.yml stop backend frontend
```

### 4. Apply Database Migrations

```bash
docker-compose -f deployment/docker-compose.prod.yml run --rm backend npx prisma migrate deploy
```

Expected output:

```
Applying migration `20260309101928_init`
Applying migration `20260309114144_add_deck_card_model`
Done in Xms
```

### 5. Import Dictionary Data (first time or if not done on staging)

This step imports 124,293 CC-CEDICT entries. Skip if already done.

```bash
# Import Kangxi radicals (fast, ~5 seconds)
docker-compose -f deployment/docker-compose.prod.yml run --rm backend npm run import-radicals

# Import CC-CEDICT dictionary (~3-5 minutes)
docker-compose -f deployment/docker-compose.prod.yml run --rm backend npm run import-cedict
```

Alternatively, use the all-in-one setup (fresh install only):

```bash
docker-compose -f deployment/docker-compose.prod.yml run --rm backend npm run setup-db
```

### 6. Restart Application Services

```bash
docker-compose -f deployment/docker-compose.prod.yml up -d backend frontend
```

### 7. Post-Deployment Verification

```bash
# Health checks
./deployment/scripts/health-check.sh production

# Verify dictionary is populated
curl https://api.yourdomain.com/api/dictionary/search?q=学&type=character

# Verify decks API (public, no auth needed)
curl https://api.yourdomain.com/decks

# Verify study mode param
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.yourdomain.com/study/next?deckId=DECK_ID&mode=review"
```

---

## Fresh Install (New Server)

```bash
# 1. Copy and configure environment
cp deployment/.env.prod.example deployment/.env.prod
# Edit .env.prod with production values

# 2. Start all services
docker-compose -f deployment/docker-compose.prod.yml up -d

# 3. Wait for PostgreSQL (~10s)
docker-compose -f deployment/docker-compose.prod.yml exec postgres pg_isready

# 4. Run migrations and seed (includes full dictionary import)
docker-compose -f deployment/docker-compose.prod.yml run --rm backend npx prisma migrate deploy
docker-compose -f deployment/docker-compose.prod.yml run --rm backend npm run setup-db
```

---

## Rollback Instructions

Only if a critical issue is found after deployment.

```bash
# 1. Stop services
docker-compose -f deployment/docker-compose.prod.yml stop backend frontend

# 2. Restore database from backup
./deployment/scripts/restore.sh backups/wxlingua_production_YYYYMMDD_HHMMSS.sql.gz production

# 3. Checkout v0.0.1 tag
git checkout v0.0.1

# 4. Restart on v0.0.1 images
docker-compose -f deployment/docker-compose.prod.yml up -d backend frontend
```

Alternatively, apply the rollback SQL manually:

```bash
docker-compose -f deployment/docker-compose.prod.yml exec postgres \
  psql -U postgres -d wxlingua \
  -f /path/to/deployment/versions/v0.0.2/rollback.sql
```

> **Prefer restore from backup** over the rollback SQL to avoid data loss.

---

## Performance Notes

- Dictionary import (~124k words) takes 3–5 minutes; plan a maintenance window
- `Word` table will grow to ~200MB after full import
- Newly added indexes (`DeckCard_deckId_idx`, `DeckCard_deckId_nextReview_idx`) improve study query performance significantly
- FSRS query for due cards: `WHERE nextReview <= NOW()` uses the composite index

---

## New Environment Variables

No new required environment variables for v0.0.2.

---

## API Changes Summary

| Method | Path                            | Change                                    |
| ------ | ------------------------------- | ----------------------------------------- |
| GET    | `/study/next`                   | Added `?mode=learn\|review` query param   |
| GET    | `/decks`                        | Response now includes `dueCount` per deck |
| GET    | `/api/dictionary/search`        | **NEW** — public, no auth                 |
| GET    | `/api/dictionary/word/:id`      | **NEW** — public, no auth                 |
| GET    | `/api/dictionary/radical/:char` | **NEW** — public, no auth                 |
| GET    | `/api/dictionary/radicals`      | **NEW** — public, no auth                 |

---

## Monitoring After Deployment

```bash
# Watch backend logs during dictionary import
docker-compose -f deployment/docker-compose.prod.yml logs -f backend

# Check PostgreSQL table sizes after import
docker-compose -f deployment/docker-compose.prod.yml exec postgres \
  psql -U postgres -d wxlingua -c \
  "SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) AS size
   FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC;"
```
