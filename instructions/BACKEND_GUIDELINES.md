# Backend Development Guidelines

## NestJS Best Practices for WxLingua

### Module Structure

Each feature should be organized as a NestJS module:

```
feature-name/
├── feature-name.module.ts      # Module definition
├── feature-name.service.ts     # Business logic
├── feature-name.controller.ts  # HTTP endpoints
├── feature-name.service.spec.ts # Unit tests
├── dto/                        # Data Transfer Objects
│   ├── create-feature.dto.ts
│   ├── update-feature.dto.ts
│   └── find-feature.dto.ts
├── entities/                   # Domain entities (if needed)
│   └── feature.entity.ts
└── interfaces/                 # TypeScript interfaces
    └── feature.interface.ts
```

### Dependency Injection

**Always use constructor injection:**

```typescript
@Injectable()
export class WordsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
}
```

**Rules:**

- Use `private readonly` for injected services
- Use `@Inject()` for custom providers
- Never use `@Inject()` for standard NestJS services

### DTOs (Data Transfer Objects)

**Every endpoint must have a DTO:**

```typescript
import { IsString, IsNotEmpty, IsOptional, IsIn } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateWordDto {
  @ApiProperty({ description: "The word text", example: "學" })
  @IsString()
  @IsNotEmpty()
  word: string;

  @ApiProperty({
    description: "Language code",
    enum: ["zh-TW", "en", "ja", "ko"],
    example: "zh-TW",
  })
  @IsString()
  @IsIn(["zh-TW", "en", "ja", "ko"])
  languageCode: string;

  @ApiPropertyOptional({ description: "Audio URL" })
  @IsString()
  @IsOptional()
  audioUrl?: string;
}
```

**DTO Guidelines:**

- One DTO per action (Create, Update, Find, etc.)
- Use class-validator decorators
- Add Swagger decorators for docs
- Use `@IsOptional()` for optional fields
- Extend `PartialType(CreateDto)` for update DTOs

### Controllers

**Keep controllers thin, delegate to services:**

```typescript
@Controller("words")
@ApiTags("words")
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get()
  @ApiOperation({ summary: "Get all words" })
  @ApiResponse({ status: 200, description: "Returns words array" })
  async findAll(@Query() query: FindWordsDto) {
    return this.wordsService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Create a new word" })
  @ApiResponse({ status: 201, description: "Word created" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async create(@Body() createWordDto: CreateWordDto) {
    return this.wordsService.create(createWordDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get word by ID" })
  @ApiResponse({ status: 200, description: "Returns word" })
  @ApiResponse({ status: 404, description: "Word not found" })
  async findOne(@Param("id") id: string) {
    const word = await this.wordsService.findOne(id);
    if (!word) {
      throw new NotFoundException(`Word with ID ${id} not found`);
    }
    return word;
  }
}
```

**Controller Rules:**

- One route handler per action
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Add Swagger decorators
- Use guards for authentication/authorization
- Validate all inputs with DTOs
- Handle errors with NestJS exceptions

### Services

**Business logic goes in services:**

```typescript
@Injectable()
export class WordsService {
  private readonly logger = new Logger(WordsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindWordsDto) {
    const { language, page = 1, limit = 20 } = params;

    const where = language ? { languageCode: language } : {};

    const [data, total] = await Promise.all([
      this.prisma.word.findMany({
        where,
        include: {
          wordRadicals: {
            include: { radical: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { frequency: "desc" },
      }),
      this.prisma.word.count({ where }),
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

  async create(createWordDto: CreateWordDto) {
    this.logger.log(`Creating word: ${createWordDto.word}`);

    try {
      return await this.prisma.word.create({
        data: createWordDto,
        include: {
          wordRadicals: {
            include: { radical: true },
          },
        },
      });
    } catch (error) {
      if (error.code === "P2002") {
        throw new ConflictException("Word already exists");
      }
      throw error;
    }
  }

  async findOne(id: string) {
    return this.prisma.word.findUnique({
      where: { id },
      include: {
        wordRadicals: {
          include: { radical: true },
          orderBy: { position: "asc" },
        },
      },
    });
  }
}
```

**Service Rules:**

- Use Logger for debugging
- Handle Prisma errors appropriately
- Use transactions for multi-step operations
- Add caching for frequently accessed data
- Document complex logic with comments

### Error Handling

**Use NestJS built-in exceptions:**

```typescript
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";

// Not found
throw new NotFoundException("Resource not found");

// Validation error
throw new BadRequestException("Invalid input");

// Auth required
throw new UnauthorizedException("Please login");

// Permission denied
throw new ForbiddenException("Admin access required");

// Duplicate resource
throw new ConflictException("Resource already exists");

// Server error
throw new InternalServerErrorException("Something went wrong");
```

### Prisma Integration

**Use Prisma efficiently:**

```typescript
// ✅ Good: Include related data in one query
const word = await this.prisma.word.findUnique({
  where: { id },
  include: {
    wordRadicals: {
      include: { radical: true },
    },
  },
});

// ❌ Bad: N+1 query problem
const words = await this.prisma.word.findMany();
for (const word of words) {
  const radicals = await this.prisma.wordRadical.findMany({
    where: { wordId: word.id },
  });
}

// ✅ Good: Use select to limit fields
const words = await this.prisma.word.findMany({
  select: {
    id: true,
    word: true,
    languageCode: true,
  },
});

// ✅ Good: Use transactions for atomicity
await this.prisma.$transaction(async (tx) => {
  const deck = await tx.deck.create({ data: deckData });
  await tx.deckWord.createMany({
    data: wordIds.map((wordId) => ({ deckId: deck.id, wordId })),
  });
});
```

### Authentication & Authorization

**JWT Authentication:**

```typescript
// In controller
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@Request() req) {
  return req.user; // Contains decoded JWT payload
}

// Role-based access
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Delete(':id')
async delete(@Param('id') id: string) {
  return this.service.delete(id);
}
```

### Validation Pipes

**Use ValidationPipe globally (already configured):**

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip unknown properties
    forbidNonWhitelisted: true, // Throw error for unknown properties
    transform: true, // Auto-transform to DTO types
  }),
);
```

### Swagger Documentation

**Document all endpoints:**

```typescript
@Controller("words")
@ApiTags("words")
@ApiBearerAuth() // Requires JWT token
export class WordsController {
  @Post()
  @ApiOperation({ summary: "Create a new word" })
  @ApiResponse({
    status: 201,
    description: "Word successfully created",
    type: WordEntity,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Word already exists" })
  async create(@Body() dto: CreateWordDto) {
    return this.service.create(dto);
  }
}
```

### Testing

**Write comprehensive tests:**

```typescript
describe("WordsService", () => {
  let service: WordsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WordsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WordsService>(WordsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe("findAll", () => {
    it("should return paginated words", async () => {
      const mockWords = [{ id: "1", word: "學" }];
      jest.spyOn(prisma.word, "findMany").mockResolvedValue(mockWords);
      jest.spyOn(prisma.word, "count").mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(mockWords);
      expect(result.meta.total).toBe(1);
    });
  });
});
```

### Performance Tips

1. **Use indexes** for frequently queried fields
2. **Implement caching** for hot data (Redis)
3. **Paginate** large result sets
4. **Use select** to limit returned fields
5. **Avoid N+1 queries** with includes
6. **Use connection pooling** (Prisma default)

### Common Patterns

#### Pagination

```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
}

async findAll({ page = 1, limit = 20 }: PaginationParams) {
  const skip = (page - 1) * limit;
  // ... query logic
}
```

#### Soft Delete

```typescript
// Add deletedAt to schema
model Word {
  deletedAt DateTime?
}

// Service method
async softDelete(id: string) {
  return this.prisma.word.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
```

#### Caching

```typescript
async findOne(id: string) {
  const cached = await this.cacheManager.get(`word:${id}`);
  if (cached) return cached;

  const word = await this.prisma.word.findUnique({ where: { id } });
  await this.cacheManager.set(`word:${id}`, word, 3600); // 1 hour
  return word;
}
```

## Checklist for New Features

- [ ] Create module with `nest g module`
- [ ] Define DTOs with validation
- [ ] Implement service logic
- [ ] Create controller with guards
- [ ] Add Swagger documentation
- [ ] Write unit tests
- [ ] Write E2E tests
- [ ] Update Prisma schema if needed
- [ ] Add error handling
- [ ] Consider caching
- [ ] Review performance
- [ ] Update API docs

---

**Follow these guidelines for consistent, maintainable backend code.**
