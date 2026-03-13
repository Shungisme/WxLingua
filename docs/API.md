# API Documentation

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.wxlingua.com`

## Interactive Documentation

Swagger UI is available at `/api/docs` for interactive API exploration and testing.

## Authentication

WxLingua API uses JWT (JSON Web Token) for authentication.

### Getting a Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

### Using the Token

Include the token in the `Authorization` header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Endpoints

### Authentication

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword",
  "name": "Jane Doe"
}
```

**Response:** `201 Created`

```json
{
  "id": "cuid456",
  "email": "newuser@example.com",
  "name": "Jane Doe",
  "role": "USER"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:** `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

---

### Words

#### Get All Words

```http
GET /words?language=zh-TW&page=1&limit=20
Authorization: Bearer {token}
```

**Query Parameters:**

- `language` (optional): Filter by language code (zh-TW, en, ja, ko)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search term

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "word123",
      "word": "學",
      "languageCode": "zh-TW",
      "frequency": 850,
      "level": "HSK3",
      "metadata": {
        "pinyin": "xué",
        "traditional": "學",
        "simplified": "学"
      },
      "audioUrl": "/audio/zh/xue.mp3",
      "wordRadicals": [
        {
          "radical": {
            "char": "子",
            "meaning": { "vi": "con", "en": "child" }
          },
          "position": 1
        }
      ]
    }
  ],
  "meta": {
    "total": 5000,
    "page": 1,
    "limit": 20,
    "totalPages": 250
  }
}
```

#### Get Word by ID

```http
GET /words/:id
Authorization: Bearer {token}
```

**Response:** `200 OK`

```json
{
  "id": "word123",
  "word": "學",
  "languageCode": "zh-TW",
  "frequency": 850,
  "level": "HSK3",
  "metadata": {
    "pinyin": "xué",
    "traditional": "學",
    "simplified": "学",
    "meanings": ["learn", "study", "school"]
  },
  "audioUrl": "/audio/zh/xue.mp3",
  "wordRadicals": [
    {
      "radical": {
        "id": "rad123",
        "char": "子",
        "strokeCount": 3,
        "meaning": { "vi": "con", "en": "child", "zh": "子部" }
      },
      "position": 1
    }
  ],
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

#### Create Word (Admin Only)

```http
POST /words
Authorization: Bearer {token}
Content-Type: application/json

{
  "word": "學",
  "languageCode": "zh-TW",
  "frequency": 850,
  "level": "HSK3",
  "metadata": {
    "pinyin": "xué",
    "traditional": "學",
    "simplified": "学",
    "meanings": ["learn", "study"]
  },
  "audioUrl": "/audio/zh/xue.mp3",
  "radicalIds": ["rad123", "rad456"]
}
```

**Response:** `201 Created`

---

### Radicals

#### Get All Radicals

```http
GET /radicals?strokeCount=3
Authorization: Bearer {token}
```

**Query Parameters:**

- `strokeCount` (optional): Filter by stroke count (1-17)
- `variant` (optional): Filter by variant type

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "rad123",
      "char": "氵",
      "variant": "simplified",
      "strokeCount": 3,
      "meaning": {
        "vi": "nước",
        "en": "water",
        "zh": "氵部"
      },
      "imageUrl": "/radicals/氵.svg",
      "frequency": 420,
      "words": []
    }
  ],
  "meta": {
    "total": 214
  }
}
```

#### Create Radical (Admin Only)

```http
POST /radicals
Authorization: Bearer {token}
Content-Type: application/json

{
  "char": "氵",
  "variant": "simplified",
  "strokeCount": 3,
  "meaning": {
    "vi": "nước",
    "en": "water",
    "zh": "氵部"
  },
  "frequency": 420
}
```

**Response:** `201 Created`

---

### Decks

#### Get All Decks

```http
GET /decks?visibility=public
Authorization: Bearer {token}
```

**Query Parameters:**

- `visibility` (optional): Filter by visibility (public, private, all)
- `userId` (optional): Filter by creator

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "deck123",
      "name": "HSK Level 3 Vocabulary",
      "description": "Essential words for HSK3",
      "visibility": "public",
      "languageCode": "zh-TW",
      "userId": "user123",
      "user": {
        "name": "John Doe"
      },
      "deckWords": [],
      "_count": {
        "deckWords": 600
      },
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Deck

```http
POST /decks
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Custom Deck",
  "description": "Personal vocabulary collection",
  "visibility": "private",
  "languageCode": "zh-TW"
}
```

**Response:** `201 Created`

#### Add Words to Deck

```http
POST /decks/:deckId/words
Authorization: Bearer {token}
Content-Type: application/json

{
  "wordIds": ["word123", "word456", "word789"]
}
```

**Response:** `200 OK`

#### Remove Word from Deck

```http
DELETE /decks/:deckId/words/:wordId
Authorization: Bearer {token}
```

**Response:** `204 No Content`

---

### Study Sessions

#### Start Study Session

```http
GET /study/session/:deckId
Authorization: Bearer {token}
```

**Response:** `200 OK`

```json
{
  "deckId": "deck123",
  "cards": [
    {
      "id": "word123",
      "word": "學",
      "languageCode": "zh-TW",
      "metadata": {
        "pinyin": "xué"
      },
      "audioUrl": "/audio/zh/xue.mp3",
      "userWord": {
        "easeFactor": 2.5,
        "interval": 1,
        "repetitions": 0,
        "nextReview": "2026-02-22T00:00:00Z"
      }
    }
  ],
  "stats": {
    "total": 600,
    "new": 20,
    "learning": 50,
    "due": 15
  }
}
```

#### Submit Review

```http
POST /study/review
Authorization: Bearer {token}
Content-Type: application/json

{
  "wordId": "word123",
  "quality": 4
}
```

**Quality Ratings:**

- `0`: Complete blackout
- `1`: Incorrect, but remembered
- `2`: Incorrect, but easy to recall
- `3`: Correct, but difficult
- `4`: Correct, with hesitation
- `5`: Perfect recall

**Response:** `200 OK`

```json
{
  "userWord": {
    "wordId": "word123",
    "easeFactor": 2.6,
    "interval": 6,
    "repetitions": 1,
    "nextReview": "2026-02-28T00:00:00Z",
    "masteryLevel": "learning"
  },
  "nextCard": {
    "id": "word456",
    "word": "生"
  }
}
```

---

### Audio URL

#### Set Word Audio URL (S3)

```http
PATCH /words/:id/audio
Authorization: Bearer {token}
Content-Type: application/json

{
  "audioUrl": "https://your-bucket.s3.amazonaws.com/audio/xue.mp3"
}
```

**Response:** `200 OK`

```json
{
  "id": "word123",
  "audioUrl": "https://your-bucket.s3.amazonaws.com/audio/xue.mp3"
}
```

#### Upload Word Audio To S3

```http
POST /words/:id/audio/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: <audio file>
```

**Accepted formats:** mp3, wav, ogg, m4a
**Max size:** 5MB

**Response:** `200 OK`

```json
{
  "id": "word123",
  "audioUrl": "https://your-bucket.s3.amazonaws.com/audio/uuid.mp3"
}
```

#### Delete Word Audio From S3

```http
DELETE /words/:id/audio
Authorization: Bearer {token}
```

**Response:** `200 OK`

---

## Error Responses

### Standard Error Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "email must be a valid email"
    }
  ]
}
```

### HTTP Status Codes

- `200 OK`: Successful GET/PUT/PATCH request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

API rate limits (planned):

- **Authenticated users**: 1000 requests/hour
- **Unauthenticated**: 100 requests/hour

Rate limit headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

## Pagination

List endpoints support pagination:

```http
GET /words?page=2&limit=50
```

**Response includes meta:**

```json
{
  "data": [...],
  "meta": {
    "total": 5000,
    "page": 2,
    "limit": 50,
    "totalPages": 100
  }
}
```

## Filtering & Sorting

### Filtering

```http
GET /words?languageCode=zh-TW&level=HSK3
```

### Sorting

```http
GET /words?sortBy=frequency&order=desc
```

Common sort fields:

- `createdAt`: Creation date
- `updatedAt`: Last update
- `frequency`: Word frequency
- `name`: Alphabetical

## Versioning

API versioning (planned for v2):

```http
GET /v2/words
```

Currently on v1 (implicit).

## SDKs & Client Libraries

Official clients (planned):

- JavaScript/TypeScript
- Python
- Swift (iOS)
- Kotlin (Android)

## Webhooks

Webhook support (planned) for:

- Study session completed
- Deck shared
- User milestone reached

## GraphQL API

GraphQL endpoint (planned):

```
POST /graphql
```

## WebSocket API

Real-time features (planned):

```
ws://localhost:3000/socket
```

Events:

- `study.progress`: Real-time study updates
- `deck.updated`: Deck content changes

## API Changelog

See [Backend CHANGELOG](../backend/CHANGELOG.md) for API version history.

## Support

- **API Issues**: [GitHub Issues](https://github.com/wxlingua/wxlingua/issues)
- **Email**: api-support@wxlingua.com
- **Swagger UI**: http://localhost:3000/api/docs
