# Testing Guidelines

## Testing Strategy for WxLingua

### Testing Pyramid

```
        /\
       /  \  E2E Tests (10%)
      /----\
     / Unit \ Integration Tests (30%)
    /  Tests \
   /----------\  Unit Tests (60%)
```

### Unit Tests

**What to Test:**

- Service methods
- Utility functions
- Business logic
- Edge cases

**Jest Configuration:**

```typescript
// jest.config.js
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s", "!**/*.module.ts", "!**/main.ts"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
};
```

**Service Unit Test Example:**

```typescript
// words.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { WordsService } from "./words.service";
import { PrismaService } from "../prisma/prisma.service";

describe("WordsService", () => {
  let service: WordsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    word: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a word", async () => {
      const createWordDto = {
        word: "學習",
        languageCode: "zh-TW",
        frequency: 5000,
      };

      const mockWord = {
        id: "word123",
        ...createWordDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.word.create.mockResolvedValue(mockWord);

      const result = await service.create(createWordDto);

      expect(result).toEqual(mockWord);
      expect(prisma.word.create).toHaveBeenCalledWith({
        data: createWordDto,
      });
    });

    it("should throw error if word already exists", async () => {
      const createWordDto = {
        word: "學習",
        languageCode: "zh-TW",
      };

      mockPrismaService.word.create.mockRejectedValue({
        code: "P2002",
      });

      await expect(service.create(createWordDto)).rejects.toThrow(
        "Word already exists",
      );
    });
  });

  describe("findAll", () => {
    it("should return paginated words", async () => {
      const mockWords = [
        { id: "1", word: "學習", languageCode: "zh-TW" },
        { id: "2", word: "語言", languageCode: "zh-TW" },
      ];

      mockPrismaService.word.findMany.mockResolvedValue(mockWords);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(mockWords);
      expect(prisma.word.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
      });
    });
  });

  describe("findOne", () => {
    it("should return a word", async () => {
      const mockWord = { id: "word123", word: "學習" };
      mockPrismaService.word.findUnique.mockResolvedValue(mockWord);

      const result = await service.findOne("word123");

      expect(result).toEqual(mockWord);
      expect(prisma.word.findUnique).toHaveBeenCalledWith({
        where: { id: "word123" },
      });
    });

    it("should throw NotFoundException if word not found", async () => {
      mockPrismaService.word.findUnique.mockResolvedValue(null);

      await expect(service.findOne("invalid")).rejects.toThrow(
        "Word not found",
      );
    });
  });
});
```

**Controller Unit Test Example:**

```typescript
// words.controller.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { WordsController } from "./words.controller";
import { WordsService } from "./words.service";

describe("WordsController", () => {
  let controller: WordsController;
  let service: WordsService;

  const mockWordsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WordsController],
      providers: [
        {
          provide: WordsService,
          useValue: mockWordsService,
        },
      ],
    }).compile();

    controller = module.get<WordsController>(WordsController);
    service = module.get<WordsService>(WordsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a word", async () => {
      const createDto = { word: "學習", languageCode: "zh-TW" };
      const mockWord = { id: "word123", ...createDto };

      mockWordsService.create.mockResolvedValue(mockWord);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockWord);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("findAll", () => {
    it("should return array of words", async () => {
      const mockWords = [
        { id: "1", word: "學習" },
        { id: "2", word: "語言" },
      ];

      mockWordsService.findAll.mockResolvedValue({
        data: mockWords,
        meta: { total: 2 },
      });

      const result = await controller.findAll(1, 20);

      expect(result.data).toEqual(mockWords);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });
});
```

### Integration Tests

**E2E Test Example:**

```typescript
// test/words.e2e-spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Words (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Get auth token
    const authResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "test@example.com",
        password: "password123",
      });

    authToken = authResponse.body.access_token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe("/words (POST)", () => {
    it("should create a word", () => {
      return request(app.getHttpServer())
        .post("/words")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          word: "學習",
          languageCode: "zh-TW",
          frequency: 5000,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body.word).toBe("學習");
          expect(res.body.languageCode).toBe("zh-TW");
        });
    });

    it("should return 400 for invalid data", () => {
      return request(app.getHttpServer())
        .post("/words")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          word: "",
          languageCode: "invalid",
        })
        .expect(400);
    });

    it("should return 401 without auth token", () => {
      return request(app.getHttpServer())
        .post("/words")
        .send({
          word: "學習",
          languageCode: "zh-TW",
        })
        .expect(401);
    });
  });

  describe("/words (GET)", () => {
    it("should return array of words", () => {
      return request(app.getHttpServer())
        .get("/words")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body).toHaveProperty("meta");
        });
    });

    it("should support pagination", () => {
      return request(app.getHttpServer())
        .get("/words?page=1&limit=10")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeLessThanOrEqual(10);
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(10);
        });
    });
  });

  describe("/words/:id (GET)", () => {
    let wordId: string;

    beforeAll(async () => {
      const word = await prisma.word.create({
        data: {
          word: "TestWord",
          languageCode: "en",
        },
      });
      wordId = word.id;
    });

    it("should return a single word", () => {
      return request(app.getHttpServer())
        .get(`/words/${wordId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(wordId);
          expect(res.body.word).toBe("TestWord");
        });
    });

    it("should return 404 for non-existent word", () => {
      return request(app.getHttpServer())
        .get("/words/invalid-id")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

### Frontend Testing (React)

**Component Test:**

```typescript
// components/features/word-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { WordCard } from './word-card';

describe('WordCard', () => {
  const mockWord = {
    id: 'word123',
    word: '學習',
    languageCode: 'zh-TW',
    audioUrl: 'https://example.com/audio.mp3',
  };

  it('renders word correctly', () => {
    render(<WordCard word={mockWord} />);

    expect(screen.getByText('學習')).toBeInTheDocument();
    expect(screen.getByText('zh-TW')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<WordCard word={mockWord} onClick={handleClick} />);

    fireEvent.click(screen.getByText('學習'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows audio player when audioUrl is provided', () => {
    render(<WordCard word={mockWord} />);

    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });

  it('does not show audio player without audioUrl', () => {
    const wordWithoutAudio = { ...mockWord, audioUrl: undefined };
    render(<WordCard word={wordWithoutAudio} />);

    expect(screen.queryByRole('button', { name: /play/i })).not.toBeInTheDocument();
  });
});
```

**Hook Test:**

```typescript
// hooks/useWords.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWords } from './useWords';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useWords', () => {
  it('fetches words successfully', async () => {
    const { result } = renderHook(() => useWords(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});
```

### Test Coverage

**Run coverage:**

```bash
# Backend
npm run test:cov

# Frontend
npm run test -- --coverage
```

**Coverage Goals:**

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Mocking

**Mock Prisma:**

```typescript
const mockPrismaService = {
  word: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};
```

**Mock API:**

```typescript
jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));
```

**Mock Next.js Router:**

```typescript
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));
```

### Testing Best Practices

1. **Arrange-Act-Assert (AAA):**

```typescript
it("should create a word", async () => {
  // Arrange
  const createDto = { word: "學習", languageCode: "zh-TW" };
  const mockWord = { id: "word123", ...createDto };
  mockService.create.mockResolvedValue(mockWord);

  // Act
  const result = await controller.create(createDto);

  // Assert
  expect(result).toEqual(mockWord);
  expect(service.create).toHaveBeenCalledWith(createDto);
});
```

2. **Test Isolation:**
   - Each test should be independent
   - Use `beforeEach` to reset state
   - Clean up after tests

3. **Descriptive Names:**

```typescript
it("should throw NotFoundException when word does not exist", () => {
  // Test logic
});
```

4. **Test Edge Cases:**
   - Empty inputs
   - Null/undefined values
   - Boundary conditions
   - Error scenarios

## Testing Checklist

- [ ] Write unit tests for all services
- [ ] Test controllers with mocked services
- [ ] Add E2E tests for critical flows
- [ ] Test error handling
- [ ] Test edge cases
- [ ] Maintain > 80% coverage
- [ ] Mock external dependencies
- [ ] Use descriptive test names
- [ ] Keep tests isolated
- [ ] Run tests before committing

---

**Write tests to ensure code quality and prevent regressions.**
