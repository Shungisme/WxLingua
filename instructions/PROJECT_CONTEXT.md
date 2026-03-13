# WxLingua Project Context

This document provides overall context about the WxLingua project for AI-assisted development.

## Project Overview

**WxLingua** is a modern language learning platform focused on effective vocabulary acquisition through:

- Spaced Repetition System (SRS) using SuperMemo-2 algorithm
- Radical decomposition for Chinese characters
- Multi-language support (Traditional Chinese, English, Japanese, Korean)
- Custom flashcard decks

## Tech Stack

### Backend

- **Framework**: NestJS 11 (Node.js + TypeScript)
- **Database**: PostgreSQL 16
- **ORM**: Prisma 6
- **Cache**: Redis 7
- **Auth**: JWT + Passport
- **Validation**: class-validator, class-transformer
- **API Docs**: Swagger/OpenAPI

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State**: TanStack Query 5
- **HTTP**: Axios
- **Animations**: Framer Motion

### DevOps

- **Containers**: Docker + Docker Compose
- **Deployment Platform**: Coolify (production)
- **SSL**: Let's Encrypt

## Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐      ┌─────────────┐
│  Frontend   │◄────►│   Backend   │
│  Next.js    │ API  │   NestJS    │
└─────────────┘      └──────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
       ┌──────────┐  ┌──────────┐  ┌──────────┐
       │PostgreSQL│  │  Redis   │  │  S3/Local│
       │ (Data)   │  │ (Cache)  │  │  (Files) │
       └──────────┘  └──────────┘  └──────────┘
```

## Core Domain Models

### User

- Authentication and profile
- Role-based permissions (USER, ADMIN)
- Owns decks and study progress

### Word

- Multi-language vocabulary entries
- Language-specific metadata (pinyin, romaji, etc.)
- Audio pronunciations
- Linked to radicals (for Chinese)

### Radical

- 214 Kangxi radicals + extended set
- Character components for decomposition
- Multi-language meanings

### Deck

- User-created flashcard collections
- Public or private visibility
- Contains multiple words

### UserWord (SRS Data)

- Tracks individual learning progress
- SuperMemo-2 algorithm parameters
- Mastery levels (NEW → MASTER)

## Key Features

### 1. Spaced Repetition System

- **Algorithm**: SuperMemo-2
- **Quality Ratings**: 0-5 scale
- **Mastery Levels**: NEW, LEARNING, YOUNG, MATURE, MASTER
- **Smart Scheduling**: Optimal review intervals

### 2. Radical Decomposition

- Break down Chinese characters into components
- Understand character meanings through radicals
- Visual stroke diagrams

### 3. Multi-language Support

Languages supported:

- **zh-TW**: Traditional Chinese (pinyin, stroke order)
- **en**: English (phonetics, part of speech)
- **ja**: Japanese (hiragana, romaji, kanji)
- **ko**: Korean (hangul, romanization)

### 4. Custom Decks

- Create personal vocabulary collections
- Share public decks
- Import/export (planned)

### 5. Progress Tracking

- Study statistics
- Mastery distribution
- Review history
- Streak tracking

## Project Structure

```
WxLingua/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/        # Authentication
│   │   ├── words/       # Word management
│   │   ├── radicals/    # Radical system
│   │   ├── decks/       # Deck management
│   │   ├── study/       # SRS study sessions
│   │   ├── prisma/      # Database service
│   │   └── common/      # Shared utilities
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── seed.ts       # Seed data
│   └── test/            # Tests
│
├── frontend/            # Next.js App
│   └── src/
│       ├── app/         # Pages (App Router)
│       ├── components/  # React components
│       └── lib/         # Utilities
│
├── deployment/          # Docker & deployment
│   ├── docker-compose.*.yml
│   ├── scripts/         # Deployment scripts
│   └── versions/        # Version history
│
├── docs/               # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   └── ...
│
└── instructions/       # AI context (this directory)
```

## Development Workflow

### Backend Development

1. Create feature module
2. Define DTOs with validation
3. Implement service logic
4. Create controller endpoints
5. Add Swagger documentation
6. Write unit + E2E tests
7. Update Prisma schema if needed

### Frontend Development

1. Design page/component structure
2. Implement UI with Tailwind CSS
3. Add data fetching with TanStack Query
4. Handle loading/error states
5. Add animations if needed
6. Test responsive design
7. Optimize performance

### Database Changes

1. Update schema.prisma
2. Create migration
3. Update seed data
4. Test locally
5. Update related services
6. Document changes

## Coding Standards

### TypeScript

- **Strict mode**: Enabled
- **Type safety**: No `any` types
- **Interfaces**: Prefer interfaces for objects
- **Enums**: Use for fixed sets

### Naming Conventions

- **Files**: kebab-case (e.g., `user-word.service.ts`)
- **Classes**: PascalCase (e.g., `UserWordService`)
- **Functions**: camelCase (e.g., `calculateNextReview`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Components**: PascalCase (e.g., `FlashCard`)

### Code Organization

- **One class per file**
- **Group related functionality**
- **Separate concerns** (service, controller, DTO)
- **DRY principle**: Don't Repeat Yourself
- **SOLID principles**

## Common Patterns

### Backend Service Pattern

```typescript
@Injectable()
export class WordsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: FindWordsDto) {
    return this.prisma.word.findMany({
      where: { languageCode: params.language },
      include: { wordRadicals: true },
    });
  }
}
```

### Frontend Data Fetching

```typescript
export default function WordsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['words'],
    queryFn: () => api.get('/words'),
  });

  if (isLoading) return <Skeleton />;
  return <WordList words={data} />;
}
```

### DTO Validation

```typescript
export class CreateWordDto {
  @IsString()
  @IsNotEmpty()
  word: string;

  @IsString()
  @IsIn(["zh-TW", "en", "ja", "ko"])
  languageCode: string;
}
```

## Testing Strategy

### Backend Tests

- **Unit tests**: Service logic
- **E2E tests**: API endpoints
- **Coverage target**: 80%+

### Frontend Tests

- **Unit tests**: Utilities
- **Component tests**: React Testing Library
- **E2E tests**: Playwright (planned)

## Performance Considerations

### Backend

- Use database indexes
- Implement caching (Redis)
- Optimize Prisma queries
- Add pagination
- Connection pooling

### Frontend

- Code splitting
- Image optimization
- Lazy loading
- Prefetching
- Memoization

## Security Best Practices

1. **Never commit secrets** (.env files)
2. **Validate all inputs** (DTOs)
3. **Use parameterized queries** (Prisma)
4. **Hash passwords** (bcrypt)
5. **Enable CORS properly**
6. **Use HTTPS** in production
7. **Implement rate limiting**
8. **Keep dependencies updated**

## Git Workflow

### Branch Naming

- `feature/description`
- `bugfix/description`
- `hotfix/description`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(words): add audio upload support
fix(auth): correct token expiration
docs(api): update endpoint documentation
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:3001
S3_REGION=ap-southeast-1
S3_BUCKET=wxlingua-dev
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_BASE_URL=https://your-bucket.s3.ap-southeast-1.amazonaws.com
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Documentation

When adding features:

1. Update API docs (Swagger)
2. Update README if needed
3. Add JSDoc comments
4. Update CHANGELOG
5. Document in `/docs` if significant

## Common Gotchas

1. **Prisma Client**: Regenerate after schema changes
2. **Next.js Cache**: Clear `.next` folder if issues
3. **Port conflicts**: Check if ports are in use
4. **CORS errors**: Verify CORS_ORIGIN matches
5. **TypeScript errors**: Run `npm run typecheck`

## Resources

- **NestJS Docs**: https://docs.nestjs.com/
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **TailwindCSS**: https://tailwindcss.com/docs

## Questions?

- Check `/docs` directory
- Review existing code
- Ask team members
- Open GitHub issue

---

**Last Updated**: 2026-02-22  
**Version**: 0.0.1
