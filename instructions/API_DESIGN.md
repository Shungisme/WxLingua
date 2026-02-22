# API Design Guidelines

## RESTful API Standards for WxLingua

### Base URL Structure

```
Production:  https://api.wxlingua.com/v1
Staging:     https://staging-api.wxlingua.com/v1
Development: http://localhost:3000/v1
```

### HTTP Methods

Use HTTP methods correctly:

- **GET**: Retrieve resources (read-only)
- **POST**: Create new resources
- **PUT**: Update entire resource
- **PATCH**: Partial update
- **DELETE**: Remove resource

### Endpoint Naming

**Resource-based URLs (nouns not verbs):**

```
✅ Good:
GET    /words
GET    /words/:id
POST   /words
PUT    /words/:id
DELETE /words/:id

❌ Bad:
GET /getWords
POST /createWord
POST /deleteWord
```

**Nested Resources:**

```
GET    /decks/:deckId/words          # Get words in a deck
POST   /decks/:deckId/words          # Add word to deck
DELETE /decks/:deckId/words/:wordId  # Remove word from deck
```

**Actions (when necessary):**

```
POST /auth/login
POST /auth/register
POST /auth/logout
POST /auth/refresh

POST /study/sessions/:id/answer  # Submit answer
POST /study/sessions/:id/skip    # Skip card
```

### Request & Response Format

**Request Headers:**

```
Content-Type: application/json
Authorization: Bearer <token>
Accept-Language: zh-TW
```

**Request Body (POST/PUT/PATCH):**

```json
{
  "word": "學習",
  "languageCode": "zh-TW",
  "frequency": 5000,
  "metadata": {
    "pinyin": "xué xí",
    "level": "HSK4"
  }
}
```

**Success Response:**

```json
{
  "id": "clxyz123",
  "word": "學習",
  "languageCode": "zh-TW",
  "frequency": 5000,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**List Response with Pagination:**

```json
{
  "data": [
    { "id": "1", "word": "學習" },
    { "id": "2", "word": "語言" }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Status Codes

Use appropriate HTTP status codes:

**Success (2xx):**

- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE

**Client Error (4xx):**

- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate resource
- `422 Unprocessable Entity` - Validation error

**Server Error (5xx):**

- `500 Internal Server Error` - Unexpected error
- `503 Service Unavailable` - Service down

### Error Response Format

**Standard Error Structure:**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/words",
  "details": [
    {
      "field": "languageCode",
      "message": "languageCode must be one of: zh-TW, en, ja, ko"
    }
  ]
}
```

**Examples:**

```json
// 401 Unauthorized
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}

// 404 Not Found
{
  "statusCode": 404,
  "message": "Word not found",
  "error": "Not Found"
}

// 409 Conflict
{
  "statusCode": 409,
  "message": "Word already exists",
  "error": "Conflict"
}
```

### Pagination

**Query Parameters:**

```
GET /words?page=1&limit=20
GET /words?page=2&limit=50
```

**Response:**

```json
{
  "data": [...],
  "meta": {
    "total": 500,
    "page": 2,
    "limit": 50,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": true
  }
}
```

**Implementation:**

```typescript
@Get()
async findAll(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
) {
  return this.wordsService.findAll({ page, limit });
}
```

### Filtering & Sorting

**Filter by Field:**

```
GET /words?languageCode=zh-TW
GET /words?frequency=gt:1000
GET /decks?visibility=PUBLIC
```

**Sort:**

```
GET /words?sort=frequency:desc
GET /words?sort=createdAt:asc
GET /words?sort=-frequency  # Descending
```

**Search:**

```
GET /words?search=學習
GET /decks?q=vocabulary
```

**Combined:**

```
GET /words?languageCode=zh-TW&frequency=gt:1000&sort=frequency:desc&page=1&limit=20
```

### Authentication

**JWT Bearer Token:**

```typescript
@Controller("words")
@UseGuards(JwtAuthGuard)
export class WordsController {
  @Get()
  async findAll(@Request() req) {
    const userId = req.user.id;
    // ...
  }
}
```

**Public Endpoints:**

```typescript
@Controller("auth")
export class AuthController {
  @Post("register")
  @Public() // Decorator to skip auth
  async register(@Body() dto: RegisterDto) {
    // ...
  }
}
```

### Rate Limiting

**Limits by Route:**

```typescript
// Global: 100 requests per 15 minutes
// Auth: 5 login attempts per 15 minutes
// Study: 1000 requests per hour

@Controller("auth")
@UseGuards(ThrottlerGuard)
export class AuthController {
  @Post("login")
  @Throttle(5, 900) // 5 requests per 15 minutes
  async login(@Body() dto: LoginDto) {
    // ...
  }
}
```

**Rate Limit Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642251600
```

### Versioning

**URL Versioning:**

```
/v1/words
/v1/decks
/v1/study/sessions
```

**Implementation:**

```typescript
// main.ts
app.setGlobalPrefix("v1");

// Future: v2 with breaking changes
app.setGlobalPrefix("v2");
```

### CORS

**Configuration:**

```typescript
// main.ts
app.enableCors({
  origin: [
    "http://localhost:3001", // Development
    "https://wxlingua.com", // Production
    "https://www.wxlingua.com", // Production
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

### API Documentation

**Swagger/OpenAPI:**

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle("WxLingua API")
  .setDescription("Multi-language flashcard learning platform")
  .setVersion("1.0")
  .addBearerAuth()
  .addTag("auth")
  .addTag("words")
  .addTag("decks")
  .addTag("study")
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("api/docs", app, document);
```

**Document DTOs:**

```typescript
export class CreateWordDto {
  @ApiProperty({ example: "學習" })
  @IsString()
  @IsNotEmpty()
  word: string;

  @ApiProperty({
    example: "zh-TW",
    enum: ["zh-TW", "en", "ja", "ko"],
  })
  @IsEnum(["zh-TW", "en", "ja", "ko"])
  languageCode: string;

  @ApiProperty({ example: 5000, required: false })
  @IsInt()
  @IsOptional()
  frequency?: number;
}
```

**Document Controllers:**

```typescript
@ApiTags("words")
@ApiBearerAuth()
@Controller("words")
export class WordsController {
  @Post()
  @ApiOperation({ summary: "Create a new word" })
  @ApiResponse({ status: 201, description: "Word created" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Word already exists" })
  async create(@Body() createWordDto: CreateWordDto) {
    return this.wordsService.create(createWordDto);
  }
}
```

### Security Best Practices

**1. Input Validation:**

```typescript
@Post()
async create(@Body(ValidationPipe) dto: CreateWordDto) {
  // ValidationPipe automatically validates
}
```

**2. SQL Injection Protection:**

```typescript
// ✅ Good - Prisma parameterized queries
await prisma.word.findMany({
  where: { word: searchTerm },
});

// ❌ Bad - Raw SQL without params
await prisma.$queryRaw(`SELECT * FROM words WHERE word = '${searchTerm}'`);
```

**3. Authentication Required:**

```typescript
@UseGuards(JwtAuthGuard)
export class SecureController {
  // All routes require authentication
}
```

**4. Authorization:**

```typescript
@Get(':id')
async findOne(@Param('id') id: string, @Request() req) {
  const word = await this.wordsService.findOne(id);

  // Check ownership
  if (word.userId !== req.user.id && word.visibility === 'PRIVATE') {
    throw new ForbiddenException();
  }

  return word;
}
```

### API Examples

**Auth Endpoints:**

```
POST /auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}

POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxyz123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Words Endpoints:**

```
GET /words?languageCode=zh-TW&page=1&limit=20
GET /words/:id
POST /words
PUT /words/:id
DELETE /words/:id
```

**Study Endpoints:**

```
POST /study/sessions
{
  "deckId": "deck123"
}

Response:
{
  "sessionId": "session123",
  "cards": [
    {
      "id": "card1",
      "word": "學習",
      "type": "RECOGNITION"
    }
  ]
}

POST /study/sessions/:id/answer
{
  "cardId": "card1",
  "quality": 4
}
```

## API Checklist

- [ ] Use RESTful resource naming
- [ ] Return appropriate status codes
- [ ] Include pagination for lists
- [ ]Validate all inputs
- [ ] Require authentication where needed
- [ ] Document with Swagger
- [ ] Handle errors consistently
- [ ] Add rate limiting
- [ ] Enable CORS properly
- [ ] Version your API

---

**Build consistent, secure, well-documented APIs.**
