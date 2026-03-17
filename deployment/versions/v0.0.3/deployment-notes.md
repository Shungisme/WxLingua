# Deployment Notes for v0.0.3

**Release Date**: March 17, 2026  
**Type**: Feature Release  
**Upgrade from**: v0.0.2

---

## Pre-Deployment Checklist

- [ ] Full database backup completed (`./deployment/scripts/backup.sh production`)
- [ ] Staging deployment verified
- [ ] Prisma migrations tested in staging
- [ ] AWS SES credentials configured in production env
- [ ] Backend/frontend container ports validated in compose config

---

## New/Required Environment Variables

Set these for backend email delivery:

```env
SES_REGION=ap-southeast-1
SES_ACCESS_KEY_ID=<aws-access-key-id>
SES_SECRET_ACCESS_KEY=<aws-secret-access-key>
SES_FROM_EMAIL=no-reply@yourdomain.com
```

---

## Upgrade Instructions

### 1. Backup database

```bash
./deployment/scripts/backup.sh production
```

### 2. Pull latest code

```bash
git checkout main
git pull origin main
```

### 3. Stop app services

```bash
docker-compose -f deployment/docker-compose.prod.yml stop backend frontend
```

### 4. Apply migrations

```bash
docker-compose -f deployment/docker-compose.prod.yml run --rm backend npx prisma migrate deploy
```

Expected migrations:

- `20260315023626_add_friend_and_direct_messages`
- `20260315043000_convert_to_message_conversation_group`

### 5. Start services

```bash
docker-compose -f deployment/docker-compose.prod.yml up -d backend frontend
```

### 6. Verify

```bash
./deployment/scripts/health-check.sh production
curl http://127.0.0.1:3000/health
```

Optional smoke tests:

- Dictionary handwriting endpoint
- Friend request flow
- Conversation list endpoint
- Password reset email sending (SES)

---

## Rollback

If critical issues appear:

1. Stop services.
2. Restore latest backup with `restore.sh`.
3. Checkout previous stable release (`v0.0.2`).
4. Start services and re-verify health.

Prefer full backup restore over manual SQL rollback.
