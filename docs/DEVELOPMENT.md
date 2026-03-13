# Development Guide

## Prerequisites

- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **npm**: 9.x or higher (comes with Node.js)
- **Docker**: 24.x or higher ([Download](https://www.docker.com/))
- **Git**: Latest version ([Download](https://git-scm.com/))
- **PostgreSQL**: 16.x (via Docker recommended)
- **Redis**: 7.x (via Docker recommended)
- **Code Editor**: VS Code recommended

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/wxlingua.git
cd wxlingua
```

### 2. Environment Configuration

#### Root Level

```bash
cp .env.example .env
```

Edit `.env`:

```env
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=wxlingua
DB_PORT=5432
REDIS_PORT=6379
BACKEND_PORT=3000
FRONTEND_PORT=3001
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/wxlingua?schema=public"
JWT_SECRET=your-secret-key-change-in-production
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:3001
```

#### Frontend

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start Infrastructure Services

```bash
# From root directory
docker-compose up -d postgres redis
```

Verify services are running:

```bash
docker-compose ps
```

### 4. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup database (push schema and seed)
npm run db:push

# Start development server
npm run start:dev
```

Backend will run on http://localhost:3000

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on http://localhost:3001

## Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Update database schema if needed
cd backend
npm run db:push

# 4. Start services
docker-compose up -d postgres redis

# 5. Start backend (terminal 1)
cd backend
npm run start:dev

# 6. Start frontend (terminal 2)
cd frontend
npm run dev
```

### Creating a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/my-new-feature

# 2. Make changes...

# 3. Run tests
npm run test

# 4. Commit changes
git add .
git commit -m "feat: add my new feature"

# 5. Push to remote
git push origin feature/my-new-feature

# 6. Create pull request
```

## Backend Development

### Project Structure

```
backend/src/
├── main.ts              # Entry point
├── app.module.ts        # Root module
├── auth/                # Authentication
├── words/               # Words module
├── radicals/            # Radicals module
├── decks/               # Decks module
├── study/               # Study sessions
├── prisma/              # Database
└── common/              # Shared code
```

### Creating a New Module

```bash
# Generate module with NestJS CLI
cd backend
npx nest generate module features/my-module
npx nest generate service features/my-module
npx nest generate controller features/my-module
```

### Database Migrations

```bash
# Create migration (development)
npm run db:migrate
# Or with custom name: npx prisma migrate dev --name add_new_field

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only!)
npm run db:reset

# Push schema without migration
npm run db:push

# Seed database
npm run db:seed

# Open Prisma Studio
npx prisma studio
```

### Adding a New Endpoint

1. **Define DTO** (`dto/create-item.dto.ts`):

```typescript
import { IsString, IsNotEmpty } from "class-validator";

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

2. **Update Service** (`item.service.ts`):

```typescript
@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  async create(createItemDto: CreateItemDto) {
    return this.prisma.item.create({
      data: createItemDto,
    });
  }
}
```

3. **Update Controller** (`item.controller.ts`):

```typescript
@Controller("items")
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemService.create(createItemDto);
  }
}
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Debugging

#### VS Code Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach NestJS",
      "port": 9229,
      "restart": true,
      "sourceMaps": true
    }
  ]
}
```

Start with debugging:

```bash
npm run start:debug
```

## Frontend Development

### Project Structure

```
frontend/src/
├── app/                 # Pages (App Router)
│   ├── (auth)/         # Auth pages
│   ├── (dashboard)/    # Dashboard pages
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/
│   ├── features/       # Domain components
│   ├── layout/         # Layout components
│   └── ui/             # UI components
└── lib/
    ├── api.ts          # API client
    └── utils.ts        # Utilities
```

### Creating a New Page

```bash
# App Router convention
mkdir -p src/app/my-page
touch src/app/my-page/page.tsx
```

Example `page.tsx`:

```typescript
export default function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
    </div>
  );
}
```

### Creating a Component

```typescript
// src/components/ui/my-component.tsx
interface MyComponentProps {
  title: string;
}

export function MyComponent({ title }: MyComponentProps) {
  return <div>{title}</div>;
}
```

### Fetching Data

Using TanStack Query:

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function WordsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['words'],
    queryFn: () => api.get('/words'),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.map(word => (
        <div key={word.id}>{word.word}</div>
      ))}
    </div>
  );
}
```

### Styling

Using Tailwind CSS:

```typescript
export function MyComponent() {
  return (
    <div className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg">
      Hello World
    </div>
  );
}
```

### Type Checking

```bash
# Type check without building
npm run typecheck

# Watch mode
npx tsc --watch --noEmit
```

## Code Style

### ESLint

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

### Prettier

```bash
# Format code
cd backend
npm run format

# Check formatting
npx prettier --check "src/**/*.ts"
```

## Git Workflow

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

Examples:

```bash
git commit -m "feat(words): add audio upload support"
git commit -m "fix(study): correct SRS calculation"
git commit -m "docs: update API documentation"
```

### Branch Naming

```
feature/description
bugfix/description
hotfix/description
refactor/description
docs/description
```

Examples:

```bash
git checkout -b feature/add-word-search
git checkout -b bugfix/fix-login-error
git checkout -b docs/update-readme
```

## Common Tasks

### Reset Database

```bash
cd backend
npm run db:reset
```

### Clear Redis Cache

```bash
docker exec -it wxlingua_redis redis-cli FLUSHALL
```

### View Logs

```bash
# Backend
cd backend
npm run start:dev

# Docker services
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update specific package
npm install package@latest
```

## Troubleshooting

### Port Already in Use

```bash
# Findlongrangesearch process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Database Connection Errors

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check connection
psql -h localhost -U postgres -d wxlingua

# Restart database
docker-compose restart postgres
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Prisma Client Out of Sync

```bash
npx prisma generate
```

## Performance Tips

### Backend

- Use Prisma's `select` to limit fields
- Add database indexes for frequently queried fields
- Use Redis caching for hot data
- Enable gzip compression

### Frontend

- Use Next.js Image component
- Implement code splitting with dynamic imports
- Prefetch critical routes
- Use React.memo for expensive components

## Security Best Practices

- Never commit `.env` files
- Use strong JWT secrets in production
- Validate all user inputs
- Sanitize database queries
- Enable CORS only for trusted origins
- Keep dependencies updated

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Getting Help

- Check [GitHub Issues](https://github.com/wxlingua/wxlingua/issues)
- Join our [Discord](https://discord.gg/wxlingua)
- Email: dev@wxlingua.com
