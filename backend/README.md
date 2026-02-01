# WxLingua Backend

Production-ready NestJS backend for WxLingua Flashcard Platform.

## Features

- **Radical Decomposition**: Extended Kangxi radicals support.
- **Words**: Multi-language support (zh-TW, en, ja, ko) with specifics metadata.
- **SRS**: Spaced Repetition System using SuperMemo-2 algorithm.
- **Decks**: User-created public and private decks.
- **Audio**: S3-ready audio upload handling (local default).
- **Security**: JWT Auth, Helmet, CORS, Validation.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   cp .env.example .env
   # Update .env if needed
   ```

3. **Start Database**
   ```bash
   docker-compose up -d postgres redis
   # Note: docker-compose up will also start the app, but for dev we usually just want DBs.
   ```

4. **Database Migration & Seed**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Run Locally**
   ```bash
   npm run start:dev
   ```

## API Documentation

Swagger UI is available at `/api/docs`.

## Deployment

Build the Docker image:
```bash
docker build -t wxlingua-backend .
```

Run with Docker Compose:
```bash
docker-compose up -d
```
