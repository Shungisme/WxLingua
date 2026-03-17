# WxLingua Backend

Production-ready NestJS API for WxLingua.

## Features

- FSRS-based spaced repetition for `UserWord` and `DeckCard` review flows.
- Dictionary APIs with 124k+ CC-CEDICT entries and 214 Kangxi radicals.
- Handwriting recognition endpoint for Chinese character lookup.
- Social features: friend requests, friendships, direct conversations/messages.
- JWT authentication, DTO validation, Swagger docs, and structured error responses.
- S3-ready media storage and AWS SES email sending for password reset.

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env
```

3. Start database services

```bash
docker-compose up -d postgres redis
```

4. Initialize database and seed core data

```bash
# Runs migrations and imports radicals + dictionary data
npm run setup-db
```

5. Start development server

```bash
npm run start:dev
```

## Useful Commands

```bash
# Tests
npm run test
npm run test:e2e

# Lint
npm run lint

# Prisma
npm run db:migrate
npm run db:seed
npm run db:reset
```

## Required Configuration Notes

- JWT: set a strong `JWT_SECRET`.
- AWS SES: configure `SES_REGION`, `SES_ACCESS_KEY_ID`, `SES_SECRET_ACCESS_KEY`, `SES_FROM_EMAIL` for email sending.
- Storage: configure S3 env vars if running with cloud storage instead of local uploads.

## API Documentation

Swagger UI: `/api/docs`

## Deployment

```bash
# Build image
docker build -t wxlingua-backend .

# Run (compose)
docker-compose up -d
```
