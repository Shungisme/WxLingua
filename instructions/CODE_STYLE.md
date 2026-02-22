# Code Style Guide

## TypeScript & Code Formatting Standards for WxLingua

### TypeScript Configuration

**Strict Mode Enabled:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### Naming Conventions

**Variables & Functions:**

```typescript
// Use camelCase
const userName = "John";
const calculateScore = () => {};

// Boolean variables with is/has/should prefix
const isActive = true;
const hasPermission = false;
const shouldRefresh = true;

// Constants in UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = "https://api.example.com";
```

**Classes & Interfaces:**

```typescript
// PascalCase for classes
class UserService {}
class WordRepository {}

// PascalCase for interfaces
interface User {
  id: string;
  name: string;
}

// Prefix interfaces with 'I' if naming collision occurs
interface IUserService {
  findUser(id: string): Promise<User>;
}
```

**Types & Enums:**

```typescript
// PascalCase for types
type UserId = string;
type CreateWordData = {
  word: string;
  languageCode: string;
};

// PascalCase for enums
enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

enum Visibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}
```

**Files & Directories:**

```
kebab-case for files:
- user-service.ts
- word-repository.ts
- create-word.dto.ts

PascalCase for components:
- WordCard.tsx
- FlashCard.tsx
- StudySession.tsx
```

### Code Organization

**Import Order:**

```typescript
// 1. External libraries
import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

// 2. Internal modules
import { PrismaService } from "../prisma/prisma.service";
import { CreateWordDto } from "./dto/create-word.dto";

// 3. Types
import type { Word } from "./types";

// 4. Relative imports
import { calculateNextReview } from "../utils/srs";
```

**File Structure:**

```typescript
// 1. Imports
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

// 2. Types/Interfaces
interface WordServiceOptions {
  includeRadicals?: boolean;
}

// 3. Constants
const DEFAULT_PAGE_SIZE = 20;

// 4. Class/Functions
@Injectable()
export class WordsService {
  // Properties
  private readonly logger: Logger;

  // Constructor
  constructor(private prisma: PrismaService) {
    this.logger = new Logger(WordsService.name);
  }

  // Public methods
  async findAll() {}
  async findOne() {}

  // Private methods
  private validateWord() {}
}

// 5. Exports
export { WordServiceOptions };
```

### Function Style

**Arrow Functions vs Regular:**

```typescript
// ✅ Use arrow functions for callbacks
const numbers = [1, 2, 3].map((n) => n * 2);
array.forEach((item) => console.log(item));

// ✅ Use regular functions for methods
class WordService {
  findAll() {
    // method body
  }
}

// ✅ Use arrow functions for standalone functions
export const calculateScore = (quality: number) => {
  return quality * 10;
};
```

**Function Length:**

```typescript
// ❌ Bad - Too long
function processWord(word: string) {
  // 100+ lines of code
}

// ✅ Good - Break into smaller functions
function processWord(word: string) {
  const validated = validateWord(word);
  const normalized = normalizeWord(validated);
  const enriched = enrichWordData(normalized);
  return enriched;
}

function validateWord(word: string) {
  // Validation logic
}

function normalizeWord(word: string) {
  // Normalization logic
}
```

**Function Parameters:**

```typescript
// ❌ Bad - Too many parameters
function createWord(
  word: string,
  languageCode: string,
  frequency: number,
  level: string,
  audioUrl: string,
  metadata: object,
) {}

// ✅ Good - Use object parameter
interface CreateWordParams {
  word: string;
  languageCode: string;
  frequency?: number;
  level?: string;
  audioUrl?: string;
  metadata?: object;
}

function createWord(params: CreateWordParams) {
  const { word, languageCode, frequency, level } = params;
}
```

### Type Annotations

**Explicit vs Inferred:**

```typescript
// ✅ Inferred - Simple cases
const name = "John";
const count = 42;
const items = [1, 2, 3];

// ✅ Explicit - Function parameters & returns
function findUser(id: string): Promise<User> {
  return prisma.user.findUnique({ where: { id } });
}

// ✅ Explicit - Complex types
const config: DatabaseConfig = {
  host: "localhost",
  port: 5432,
};

// ❌ Bad - Redundant annotation
const message: string = "Hello"; // Type is obvious

// ✅ Good
const message = "Hello";
```

**Avoid `any`:**

```typescript
// ❌ Bad
function processData(data: any) {
  return data.value;
}

// ✅ Good - Use specific type
interface DataItem {
  value: string;
}

function processData(data: DataItem) {
  return data.value;
}

// ✅ Good - Use generic
function processData<T extends { value: string }>(data: T) {
  return data.value;
}

// ⚠️ Acceptable - Use `unknown` if type truly unknown
function processData(data: unknown) {
  if (typeof data === "object" && data !== null && "value" in data) {
    return (data as { value: string }).value;
  }
}
```

### Comments

**When to Comment:**

```typescript
// ✅ Good - Explain WHY, not WHAT
// SuperMemo-2 algorithm requires quality >= 3 for successful recall
if (quality >= 3) {
  interval = previousInterval * easeFactor;
}

// ❌ Bad - Obvious comment
// Increment counter
counter++;

// ✅ Good - Document complex logic
/**
 * Calculate next review date using SuperMemo-2 algorithm
 * @param quality User's recall quality (0-5)
 * @param previousInterval Last interval in days
 * @param previousEaseFactor Last ease factor
 * @returns Next interval in days
 */
function calculateNextInterval(
  quality: number,
  previousInterval: number,
  previousEaseFactor: number,
): number {
  // Implementation
}
```

**JSDoc for Public APIs:**

```typescript
/**
 * Service for managing words in the system
 */
@Injectable()
export class WordsService {
  /**
   * Find all words with optional filtering and pagination
   * @param options Query options (page, limit, filters)
   * @returns Paginated list of words
   * @throws {BadRequestException} If options are invalid
   */
  async findAll(options: FindAllOptions): Promise<PaginatedResult<Word>> {
    // Implementation
  }
}
```

### Error Handling

**Specific Error Types:**

```typescript
// ✅ Good
try {
  const word = await this.wordsService.findOne(id);
} catch (error) {
  if (error instanceof NotFoundException) {
    throw new HttpException("Word not found", HttpStatus.NOT_FOUND);
  }
  if (error.code === "P2002") {
    throw new ConflictException("Word already exists");
  }
  throw error;
}

// ❌ Bad - Generic catch
try {
  const word = await this.wordsService.findOne(id);
} catch (error) {
  throw new Error("Something went wrong");
}
```

### Async/Await

**Prefer async/await over Promises:**

```typescript
// ✅ Good
async function getWord(id: string) {
  const word = await prisma.word.findUnique({ where: { id } });
  return word;
}

// ❌ Less readable
function getWord(id: string) {
  return prisma.word.findUnique({ where: { id } }).then((word) => {
    return word;
  });
}

// ✅ Parallel operations
async function getUserData(userId: string) {
  const [user, decks, progress] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.deck.findMany({ where: { userId } }),
    prisma.userWord.findMany({ where: { userId } }),
  ]);

  return { user, decks, progress };
}
```

### Object & Array Operations

**Destructuring:**

```typescript
// ✅ Good
const { id, name, email } = user;
const [first, second, ...rest] = items;

// ❌ Less clean
const id = user.id;
const name = user.name;
const email = user.email;
```

**Spread Operator:**

```typescript
// ✅ Good - Merge objects
const updated = { ...original, status: "active" };

// ✅ Good - Copy arrays
const newArray = [...oldArray, newItem];

// ✅ Good - Function arguments
const numbers = [1, 2, 3];
Math.max(...numbers);
```

**Optional Chaining:**

```typescript
// ✅ Good
const audioUrl = word?.metadata?.audio?.url;
const firstDeck = user?.decks?.[0];

// ❌ Old way
const audioUrl =
  word && word.metadata && word.metadata.audio
    ? word.metadata.audio.url
    : undefined;
```

**Nullish Coalescing:**

```typescript
// ✅ Good - Use ?? for null/undefined
const limit = options.limit ?? 20;
const name = user.name ?? "Anonymous";

// ⚠️ Different - || also treats '', 0, false as falsy
const limit = options.limit || 20; // 0 would become 20
```

### ESLint & Prettier

**ESLint Config:**

```javascript
// eslint.config.mjs
export default [
  {
    rules: {
      "no-console": "warn",
      "no-debugger": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];
```

**Prettier Config:**

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

### React/Next.js Specific

**Component Style:**

```tsx
// ✅ Good - Destructure props
export function WordCard({ word, onClick }: WordCardProps) {
  return <div onClick={onClick}>{word.word}</div>;
}

// ❌ Less clean
export function WordCard(props: WordCardProps) {
  return <div onClick={props.onClick}>{props.word.word}</div>;
}
```

**Conditional Rendering:**

```tsx
// ✅ Good - Simple conditions
{
  isLoading && <LoadingSpinner />;
}
{
  error && <ErrorMessage error={error} />;
}
{
  data && <WordList words={data} />;
}

// ✅ Good - Ternary for if/else
{
  isActive ? <ActiveIcon /> : <InactiveIcon />;
}

// ❌ Bad - Complex JSX in ternary
{
  isLoading ? (
    <div>
      <Spinner />
      <p>Loading...</p>
    </div>
  ) : (
    <div>
      <Content />
    </div>
  );
}

// ✅ Better - Extract to variable
const content = isLoading ? <LoadingState /> : <ContentState />;
return <div>{content}</div>;
```

## Style Checklist

- [ ] Use TypeScript strict mode
- [ ] Follow naming conventions (camelCase, PascalCase)
- [ ] Organize imports properly
- [ ] Add type annotations where needed
- [ ] Avoid `any` type
- [ ] Write meaningful comments
- [ ] Use async/await
- [ ] Use modern JavaScript features
- [ ] Follow ESLint rules
- [ ] Format with Prettier

---

**Consistent code style improves readability and maintainability.**
