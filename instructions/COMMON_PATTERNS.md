# Common Patterns & Code Snippets

## Frequently Used Patterns in WxLingua

### Backend Patterns

#### CRUD Service Pattern

```typescript
// words.service.ts
@Injectable()
export class WordsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateWordDto) {
    try {
      return await this.prisma.word.create({
        data: createDto,
      });
    } catch (error) {
      if (error.code === "P2002") {
        throw new ConflictException("Word already exists");
      }
      throw error;
    }
  }

  async findAll(options: PaginationDto) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.word.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.word.count(),
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

  async findOne(id: string) {
    const word = await this.prisma.word.findUnique({
      where: { id },
      include: {
        wordRadicals: {
          include: { radical: true },
        },
      },
    });

    if (!word) {
      throw new NotFoundException("Word not found");
    }

    return word;
  }

  async update(id: string, updateDto: UpdateWordDto) {
    try {
      return await this.prisma.word.update({
        where: { id },
        data: updateDto,
      });
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException("Word not found");
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.word.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException("Word not found");
      }
      throw error;
    }
  }
}
```

#### Controller with Guards Pattern

```typescript
// words.controller.ts
@ApiTags("words")
@Controller("words")
@UseGuards(JwtAuthGuard)
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new word" })
  @ApiResponse({ status: 201, description: "Word created successfully" })
  @ApiResponse({ status: 409, description: "Word already exists" })
  create(@Body() createWordDto: CreateWordDto) {
    return this.wordsService.create(createWordDto);
  }

  @Get()
  @Public() // Public decorator to bypass JwtAuthGuard
  @ApiOperation({ summary: "Get all words" })
  findAll(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.wordsService.findAll({ page, limit });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get word by ID" })
  @ApiResponse({ status: 200, description: "Word found" })
  @ApiResponse({ status: 404, description: "Word not found" })
  findOne(@Param("id") id: string) {
    return this.wordsService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update word" })
  update(@Param("id") id: string, @Body() updateWordDto: UpdateWordDto) {
    return this.wordsService.update(id, updateWordDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete word" })
  remove(@Param("id") id: string) {
    return this.wordsService.remove(id);
  }
}
```

#### DTO Validation Pattern

```typescript
// create-word.dto.ts
export class CreateWordDto {
  @ApiProperty({ example: "學習" })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  word: string;

  @ApiProperty({
    example: "zh-TW",
    enum: ["zh-TW", "en", "ja", "ko"],
  })
  @IsEnum(["zh-TW", "en", "ja", "ko"])
  languageCode: string;

  @ApiProperty({ example: 5000, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  frequency?: number;

  @ApiProperty({ example: "HSK4", required: false })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

// update-word.dto.ts
export class UpdateWordDto extends PartialType(CreateWordDto) {}
```

#### Transaction Pattern

```typescript
async addWordsToDeck(deckId: string, wordIds: string[]) {
  return await this.prisma.$transaction(async (tx) => {
    // Verify deck exists
    const deck = await tx.deck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    // Add words to deck
    const deckWords = await tx.deckWord.createMany({
      data: wordIds.map((wordId) => ({
        deckId,
        wordId,
      })),
      skipDuplicates: true,
    });

    // Update deck word count
    await tx.deck.update({
      where: { id: deckId },
      data: {
        wordCount: {
          increment: deckWords.count,
        },
      },
    });

    return deckWords;
  });
}
```

### Frontend Patterns

#### Data Fetching with React Query

```typescript
// hooks/useWords.ts
export function useWords(params?: WordsQueryParams) {
  return useQuery({
    queryKey: ["words", params],
    queryFn: () => api.get<Word[]>("/words", params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWord(id: string) {
  return useQuery({
    queryKey: ["words", id],
    queryFn: () => api.get<Word>(`/words/${id}`),
    enabled: !!id, // Only run if id exists
  });
}

export function useCreateWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWordDto) => api.post("/words", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["words"] });
    },
  });
}

export function useUpdateWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWordDto }) =>
      api.put(`/words/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["words"] });
      queryClient.invalidateQueries({ queryKey: ["words", variables.id] });
    },
  });
}
```

#### List Page Pattern

```typescript
// app/words/page.tsx
'use client';

export default function WordsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useWords({ page, search });

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Words</h1>
        <Button onClick={() => router.push('/words/new')}>
          Add Word
        </Button>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search words..."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <WordCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data?.data.map((word) => (
              <WordCard
                key={word.id}
                word={word}
                onClick={() => router.push(`/words/${word.id}`)}
              />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={data?.meta.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
```

#### Form Pattern

```typescript
// components/forms/CreateWordForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const wordSchema = z.object({
  word: z.string().min(1, 'Word is required'),
  languageCode: z.enum(['zh-TW', 'en', 'ja', 'ko']),
  frequency: z.number().int().min(0).optional(),
});

type WordFormData = z.infer<typeof wordSchema>;

export function CreateWordForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const createWord = useCreateWord();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WordFormData>({
    resolver: zodResolver(wordSchema),
  });

  const onSubmit = async (data: WordFormData) => {
    try {
      await createWord.mutateAsync(data);
      toast.success('Word created successfully');
      onSuccess?.();
      router.push('/words');
    } catch (error) {
      toast.error('Failed to create word');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Word
        </label>
        <input
          {...register('word')}
          className="w-full border rounded px-3 py-2"
        />
        {errors.word && (
          <p className="text-red-500 text-sm mt-1">
            {errors.word.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Language
        </label>
        <select
          {...register('languageCode')}
          className="w-full border rounded px-3 py-2"
        >
          <option value="zh-TW">Traditional Chinese</option>
          <option value="en">English</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
        </select>
        {errors.languageCode && (
          <p className="text-red-500 text-sm mt-1">
            {errors.languageCode.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Frequency (optional)
        </label>
        <input
          type="number"
          {...register('frequency', { valueAsNumber: true })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Creating...' : 'Create Word'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

### Utility Functions

#### SuperMemo-2 Algorithm

```typescript
// utils/srs.ts
interface SRSData {
  interval: number;
  repetition: number;
  easeFactor: number;
}

/**
 * Calculate next review using SuperMemo-2 algorithm
 * @param quality User rating (0-5)
 * @param previous Previous SRS data
 * @returns Updated SRS data
 */
export function calculateNextReview(
  quality: number,
  previous: SRSData,
): SRSData {
  let { interval, repetition, easeFactor } = previous;

  if (quality >= 3) {
    // Correct response
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  } else {
    // Incorrect response - restart
    interval = 1;
    repetition = 0;
  }

  // Update ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  return { interval, repetition, easeFactor };
}

export function getNextReviewDate(intervalDays: number): Date {
  const next = new Date();
  next.setDate(next.getDate() + intervalDays);
  next.setHours(0, 0, 0, 0); // Reset time to midnight
  return next;
}
```

#### Date Formatting

```typescript
// utils/date.ts
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

export function isOverdue(date: Date | string): boolean {
  const reviewDate = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return reviewDate < now;
}
```

#### API Error Handler

```typescript
// lib/error-handler.ts
export function handleApiError(error: any): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    switch (status) {
      case 400:
        throw new Error(`Invalid request: ${message}`);
      case 401:
        // Redirect to login
        window.location.href = "/login";
        throw new Error("Unauthorized");
      case 403:
        throw new Error("You do not have permission");
      case 404:
        throw new Error("Resource not found");
      case 409:
        throw new Error(`Conflict: ${message}`);
      case 422:
        throw new Error(`Validation error: ${message}`);
      case 500:
        throw new Error("Server error. Please try again later.");
      default:
        throw new Error(message || "An error occurred");
    }
  }

  throw error;
}
```

### Environment Variables

```typescript
// lib/env.ts
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

// Validate required env vars
const requiredEnvVars = ["NEXT_PUBLIC_API_URL"];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

## Pattern Checklist

- [ ] Use CRUD service pattern for data operations
- [ ] Implement proper error handling
- [ ] Add validation with DTOs
- [ ] Use transactions for atomic operations
- [ ] Implement React Query for data fetching
- [ ] Create reusable form components
- [ ] Add loading and error states
- [ ] Use utility functions for common operations
- [ ] Implement proper type safety
- [ ] Follow consistent patterns across codebase

---

**Reuse these patterns to maintain consistency and speed up development.**
