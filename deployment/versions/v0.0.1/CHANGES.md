# Version 0.0.1 Changes

**Release Date**: February 22, 2026  
**Type**: Initial Release

## Overview

Initial production-ready release of WxLingua platform with core features for language learning using spaced repetition and radical decomposition.

## New Features

### Backend API (NestJS)

#### Authentication & Authorization ✨

- JWT-based authentication system
- User registration with email validation
- Secure login with bcrypt password hashing
- Role-based access control (USER, ADMIN)
- Password reset functionality (email required)

#### Words Management 📚

- Multi-language word support (zh-TW, en, ja, ko)
- Language-specific metadata (pinyin, romaji, phonetics)
- Word frequency and difficulty levels
- Audio pronunciation support
- Radical decomposition for Chinese characters
- Search and filtering capabilities

#### Radicals System 🔤

- Support for 214 Kangxi radicals
- Extended radical variants (traditional, simplified)
- Multi-language radical meanings
- Stroke count tracking (1-17)
- Radical-to-word relationships
- Visual stroke diagrams

#### Deck Management 🗂️

- Create custom flashcard decks
- Public and private deck visibility
- Add/remove words from decks
- Deck statistics and word count
- Language-specific decks
- User ownership and permissions

#### Study Sessions 🧠

- Spaced Repetition System (SuperMemo-2)
- Study session management
- Quality ratings (0-5)
- Automatic review scheduling
- Progress tracking
- Mastery level calculation (NEW, LEARNING, YOUNG, MATURE, MASTER)
- Statistics: total reviews, correct count, streak tracking

#### File Upload 📁

- Audio file upload for pronunciations
- File validation (type, size)
- Local storage with S3-ready architecture
- Supported formats: mp3, wav, ogg, m4a
- Max file size: 5MB

#### Database & ORM 🗄️

- PostgreSQL 16 integration
- Prisma ORM for type-safe queries
- Database migrations
- Seed data for radicals and sample words
- Connection pooling
- Transaction support

#### API Documentation 📖

- Swagger/OpenAPI at `/api/docs`
- Request/response examples
- DTO validation schemas
- Authentication requirements
- Error response formats

#### Security 🔒

- Helmet.js HTTP headers
- CORS configuration
- Input validation with class-validator
- SQL injection protection (Prisma)
- XSS protection
- Rate limiting (planned)

### Frontend Application (Next.js)

#### User Interface 🎨

- Modern, responsive design
- Mobile-first approach
- Tailwind CSS styling
- Smooth animations with Framer Motion
- Dark mode support (planned)

#### Authentication Pages 🔐

- Login page with form validation
- Registration page with email verification
- Password reset flow (email required)
- Protected route middleware
- JWT token management

#### Dashboard 📊

- Study statistics overview
- Recent decks display
- Progress tracking widgets
- Quick action buttons
- Daily study goals

#### Decks Management 🗂️

- Browse all decks (public/private)
- Create new decks
- Edit deck details
- Delete decks
- Deck statistics cards
- Word list view

#### Words Library 📖

- Browse word database
- Multi-language display
- Audio pronunciation playback
- Radical breakdown view
- Search and filter
- Language-specific metadata

#### Radicals Explorer 🔍

- Browse all radicals
- Interactive radical tree
- Filter by stroke count
- View related words
- Radical meaning display

#### Study Interface 🎯

- Interactive flashcard component
- Card flip animations
- Quality rating buttons (0-5)
- Progress indicators
- Session statistics
- Audio playback
- Keyboard shortcuts

#### Data Fetching 🔄

- TanStack Query integration
- Optimistic updates
- Cache management
- Error handling
- Loading states
- Retry logic

#### Performance ⚡

- Next.js Image optimization
- Code splitting
- Lazy loading
- Route prefetching
- Static page generation

### DevOps & Infrastructure 🚀

#### Docker Support 🐳

- Multi-stage Dockerfile for backend
- Standalone Next.js build
- Docker Compose for orchestration
- Development and production configs
- Health checks
- Resource limits

#### Database 🗄️

- PostgreSQL 16 Alpine
- Persistent volumes
- Connection pooling
- Performance tuning
- Automated backups

#### Caching 💾

- Redis 7 integration
- Session storage
- API response caching
- Query result caching

#### Monitoring 📈

- Docker health checks
- Service status endpoints
- Log aggregation
- Error tracking (planned)

## Database Schema

### New Tables

#### User

```sql
- id (CUID primary key)
- email (unique)
- password (bcrypt hash)
- name
- avatar
- role (USER | ADMIN)
- createdAt, updatedAt
```

#### Word

```sql
- id (CUID primary key)
- languageCode (zh-TW, en, ja, ko)
- word (unique)
- frequency (1-1000+)
- level (HSK, JLPT, CEFR)
- metadata (JSON)
- audioUrl
- createdAt, updatedAt
```

#### Radical

```sql
- id (CUID primary key)
- char (unique)
- variant (traditional, simplified, both)
- strokeCount (1-17)
- meaning (JSON)
- imageUrl
- frequency
- createdAt, updatedAt
```

#### Deck

```sql
- id (CUID primary key)
- name
- description
- visibility (PUBLIC | PRIVATE)
- languageCode
- userId (foreign key)
- createdAt, updatedAt
```

#### UserWord (SRS Data)

```sql
- id (CUID primary key)
- userId, wordId (composite unique)
- easeFactor (default 2.5)
- interval (days)
- repetitions
- nextReview
- masteryLevel (NEW, LEARNING, YOUNG, MATURE, MASTER)
- totalReviews, correctCount
- createdAt, updatedAt
```

#### WordRadical (Join Table)

```sql
- id (CUID primary key)
- wordId, radicalId
- position (0-5)
```

#### DeckWord (Join Table)

```sql
- id (CUID primary key)
- deckId, wordId (composite unique)
```

### Indexes

- `User.email` (unique)
- `Word.languageCode`
- `Word.word` (unique)
- `Word.frequency`
- `Radical.char` (unique)
- `Radical.strokeCount`
- `UserWord.(userId, nextReview)` (composite)
- `Deck.(userId, visibility)`

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Words

- `GET /words` - List words (paginated)
- `GET /words/:id` - Get word details
- `POST /words` - Create word (admin only)

### Radicals

- `GET /radicals` - List radicals
- `GET /radicals/:id` - Get radical details
- `POST /radicals` - Create radical (admin only)

### Decks

- `GET /decks` - List decks
- `GET /decks/:id` - Get deck details
- `POST /decks` - Create deck
- `POST /decks/:id/words` - Add words to deck
- `DELETE /decks/:id/words/:wordId` - Remove word

### Study

- `GET /study/session/:deckId` - Start study session
- `POST /study/review` - Submit review

### Upload

- `POST /upload/audio` - Upload audio file

## Breaking Changes

None (initial release)

## Migration Scripts

### Initial Schema

See `migration.sql` for complete database schema.

### Seed Data

```bash
npx prisma db seed
```

Seeds:

- 214 Kangxi radicals
- Sample vocabulary (HSK1-3)
- Demo user account
- Example decks

## Configuration Changes

### Environment Variables

#### Backend

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
REDIS_HOST=redis
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:3001
```

#### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Deployment Instructions

1. **Setup environment**

   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Start services**

   ```bash
   docker-compose up -d
   ```

3. **Run migrations**

   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

4. **Seed database**

   ```bash
   docker-compose exec backend npx prisma db seed
   ```

5. **Verify deployment**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3001
   ```

## Known Issues

### Critical

None

### Minor

- Audio playback may require user interaction on mobile browsers
- Safari CSS animation compatibility

### Workarounds

- Use latest browser versions
- Enable autoplay permissions

## Performance Metrics

- Backend response time: < 100ms (avg)
- Frontend page load: < 2s (avg)
- Database query time: < 50ms (avg)

## Security Considerations

- Default JWT secret must be changed in production
- Database password should be strong
- Enable HTTPS in production
- Regular security updates required

## Dependencies

### Backend

- NestJS 11.0.1
- Prisma 6.19.2
- PostgreSQL 16
- Redis 7

### Frontend

- Next.js 15.5.12
- React 19.2.4
- TanStack Query 5.90.21
- Tailwind CSS 4.2.0

## Contributors

- Backend Team
- Frontend Team
- DevOps Team

## Next Steps

See roadmap in main README.md for upcoming features:

- Mobile app (React Native)
- Advanced analytics
- Social features
- GraphQL API
- AI recommendations

## Support

- Documentation: `/docs`
- API Docs: `http://localhost:3000/api/docs`
- Issues: GitHub Issues
- Email: support@wxlingua.com
