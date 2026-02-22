# WxLingua Architecture

## System Overview

WxLingua is a full-stack language learning platform built with modern web technologies. The system follows a microservices-inspired architecture with clear separation between frontend, backend, and data layers.

```
┌─────────────────────────────────────────────────────────┐
│                        Client                            │
│                  (Browser / Mobile)                      │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│                   (nginx / CDN)                         │
└────────┬─────────────────────────────┬──────────────────┘
         │                             │
         ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│                  │          │                  │
│  Frontend (SSR)  │          │   Backend API    │
│   Next.js 15     │◄────────►│    NestJS 11     │
│   React 19       │   API    │   TypeScript     │
│                  │          │                  │
└──────────────────┘          └────────┬─────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │  PostgreSQL  │  │    Redis     │  │  File Store  │
            │  (Primary)   │  │  (Cache)     │  │  (S3/Local)  │
            └──────────────┘  └──────────────┘  └──────────────┘
```

## Component Architecture

### Frontend Layer

#### Technology Stack

- **Next.js 15**: React framework with App Router
- **React 19**: UI library with Server Components
- **TanStack Query**: Server state management
- **Tailwind CSS 4**: Utility-first styling
- **Framer Motion**: Animations

#### Key Features

- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- Client-Side Navigation
- Optimistic UI Updates
- Image Optimization

#### Directory Structure

```
frontend/src/
├── app/                    # App Router pages
│   ├── (auth)/            # Auth route group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Dashboard route group
│   │   ├── dashboard/
│   │   ├── decks/
│   │   ├── words/
│   │   ├── radicals/
│   │   └── study/
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── features/          # Domain-specific components
│   │   ├── deck-card.tsx
│   │   ├── flashcard.tsx
│   │   ├── radical-tree.tsx
│   │   ├── study-session.tsx
│   │   └── word-card.tsx
│   ├── layout/            # Layout components
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   └── ui/                # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
└── lib/
    ├── api.ts             # API client
    └── utils.ts           # Utilities
```

### Backend Layer

#### Technology Stack

- **NestJS 11**: Progressive Node.js framework
- **Prisma 6**: Type-safe ORM
- **PostgreSQL 16**: Primary database
- **Redis 7**: Caching layer
- **Passport JWT**: Authentication

#### Architecture Patterns

- **Modular Architecture**: Feature-based modules
- **Dependency Injection**: NestJS DI container
- **Repository Pattern**: Data access abstraction
- **Event-Driven**: Domain events for loose coupling

#### Module Structure

```
backend/src/
├── main.ts                # Application entry point
├── app.module.ts          # Root module
├── auth/                  # Authentication module
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── jwt.strategy.ts
│   └── dto/
├── words/                 # Words module
│   ├── words.module.ts
│   ├── words.service.ts
│   ├── words.controller.ts
│   └── dto/
├── radicals/              # Radicals module
├── decks/                 # Decks module
├── study/                 # Study sessions module
├── upload/                # File upload module
├── prisma/                # Prisma module
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── common/                # Shared code
    ├── constants/
    ├── pipes/
    ├── guards/
    └── interceptors/
```

### Data Layer

#### PostgreSQL Schema

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │────>│   Deck   │<────│   Word   │
└──────────┘     └──────────┘     └──────────┘
     │                │                  │
     │                │                  │
     ▼                ▼                  ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│UserWord  │     │DeckWord  │     │Radical   │
│(SRS Data)│     │          │     │          │
└──────────┘     └──────────┘     └──────────┘
                                       │
                                       ▼
                                 ┌──────────┐
                                 │WordRad.  │
                                 └──────────┘
```

#### Key Models

- **User**: Authentication and profile
- **Word**: Multi-language vocabulary
- **Radical**: Chinese character components
- **Deck**: Flashcard collections
- **UserWord**: SRS study progress
- **DeckWord**: Deck membership
- **WordRadical**: Character decomposition

#### Redis Cache Strategy

- **User Sessions**: JWT token blacklist
- **API Response Cache**: Frequently accessed data
- **Rate Limiting**: Request throttling
- **Study Queue**: Active study sessions

## Data Flow

### Authentication Flow

```
1. User submits credentials
   ├─> Frontend: Login form submission
   ├─> Backend: POST /auth/login
   ├─> Validate credentials (bcrypt)
   ├─> Generate JWT token
   └─> Return token to client

2. Authenticated requests
   ├─> Frontend: Attach token in header
   ├─> Backend: JWT strategy validates
   ├─> Passport deserializes user
   └─> Request proceeds
```

### Study Session Flow

```
1. Start session
   ├─> Frontend: GET /study/session/:deckId
   ├─> Backend: Fetch due cards (SRS algorithm)
   ├─> Calculate priority
   └─> Return cards

2. Submit answer
   ├─> Frontend: POST /study/review
   ├─> Backend: Calculate new interval
   ├─> Update UserWord (SuperMemo-2)
   ├─> Increment statistics
   └─> Return next card
```

### Word Creation Flow

```
1. Upload audio
   ├─> Frontend: File input
   ├─> Backend: POST /upload/audio
   ├─> Validate file (multer)
   ├─> Save to storage
   └─> Return URL

2. Create word
   ├─> Frontend: POST /words
   ├─> Backend: Validate DTO
   ├─> Link radicals
   ├─> Link audio
   ├─> Save to database
   └─> Return word entity
```

## Security Architecture

### Authentication & Authorization

- **JWT Tokens**: Stateless authentication
- **Refresh Tokens**: Long-lived sessions (planned)
- **Role-Based Access**: User/Admin roles
- **Route Guards**: Protected endpoints

### Data Security

- **Password Hashing**: bcrypt with salt
- **Input Validation**: class-validator DTOs
- **SQL Injection Protection**: Prisma ORM
- **XSS Protection**: Helmet.js
- **CORS**: Configurable origins

### API Security

- **Rate Limiting**: Redis-based (planned)
- **Request Signing**: API keys (planned)
- **HTTPS Only**: Enforced in production
- **Security Headers**: Helmet.js middleware

## Performance Optimizations

### Frontend

- **Code Splitting**: Dynamic imports
- **Image Optimization**: Next.js Image component
- **Prefetching**: Link prefetch
- **Lazy Loading**: React.lazy
- **Memoization**: useMemo, useCallback

### Backend

- **Database Indexing**: Primary/foreign keys
- **Query Optimization**: Prisma select/include
- **Connection Pooling**: Prisma connection pool
- **Caching**: Redis for hot data
- **Compression**: gzip responses

### Database

- **Indexes**: On foreign keys and search fields
- **Materialized Views**: For complex queries (planned)
- **Partitioning**: For large tables (planned)
- **Replication**: Read replicas (planned)

## Scalability Considerations

### Horizontal Scaling

- **Stateless Backend**: Multiple API instances
- **Load Balancing**: nginx/ALB
- **Session Store**: Redis for shared sessions
- **File Storage**: S3 for uploads

### Vertical Scaling

- **Database**: PostgreSQL tuning
- **Redis**: Memory optimization
- **Node.js**: Worker threads (planned)

### Microservices Evolution

Potential future split:

- **Auth Service**: Authentication/authorization
- **Study Service**: SRS algorithm
- **Content Service**: Words/radicals/decks
- **Media Service**: Audio/image uploads

## Monitoring & Observability

### Application Monitoring (Planned)

- **APM**: New Relic / DataDog
- **Error Tracking**: Sentry
- **Logging**: Winston / Pino
- **Metrics**: Prometheus

### Infrastructure Monitoring

- **Container Health**: Docker healthchecks
- **Database**: pg_stat_statements
- **Redis**: redis-cli info
- **Uptime**: StatusPage

## Deployment Architecture

### Development

```
┌──────────────┐
│  Developer   │
│   Machine    │
│              │
│ Backend:3000 │
│Frontend:3001 │
│ Postgres:5432│
│  Redis:6379  │
└──────────────┘
```

### Production

```
┌─────────────────────────────────────────┐
│              Load Balancer               │
└────────┬─────────────────────────┬──────┘
         │                         │
    ┌────▼────┐              ┌─────▼────┐
    │Frontend │              │ Backend  │
    │Container│              │Container │
    │  x3     │              │   x3     │
    └─────────┘              └─────┬────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            ┌──────────┐   ┌──────────┐   ┌──────────┐
            │PostgreSQL│   │  Redis   │   │    S3    │
            │ (RDS)    │   │(Cluster) │   │ (Media)  │
            └──────────┘   └──────────┘   └──────────┘
```

## Technology Decisions

### Why NestJS?

- Enterprise-grade architecture
- TypeScript first-class support
- Excellent DI system
- Great documentation
- Active community

### Why Next.js?

- Best-in-class React framework
- Server-side rendering
- Excellent DX
- Built-in optimizations
- Vercel ecosystem

### Why Prisma?

- Type-safe database access
- Great migration system
- Modern DX
- Multi-database support
- Auto-completion

### Why PostgreSQL?

- ACID compliance
- Rich data types (JSON)
- Full-text search
- Mature ecosystem
- Great performance

## Future Enhancements

### Short-term (Q2 2026)

- [ ] Refresh token rotation
- [ ] Rate limiting
- [ ] Full-text search
- [ ] Advanced analytics
- [ ] Social features

### Long-term (2026-2027)

- [ ] GraphQL API
- [ ] WebSocket support
- [ ] Machine learning for recommendations
- [ ] Mobile apps (React Native)
- [ ] Offline support (PWA)
- [ ] Microservices architecture
- [ ] Multi-region deployment

## References

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [SuperMemo-2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
