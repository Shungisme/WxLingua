# Changelog

All notable changes to the WxLingua Backend API will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- GraphQL API support
- WebSocket for real-time study sessions
- Advanced analytics and study statistics
- Social features (follow users, share decks)
- AI-powered word suggestions

## [0.0.1] - 2026-02-22

### Added

- **Authentication Module**
  - JWT-based authentication with Passport
  - User registration and login endpoints
  - Password hashing with bcrypt
  - Role-based access control (USER, ADMIN)

- **Radicals Module**
  - Support for 214 Kangxi radicals
  - Extended radical variants (traditional, simplified)
  - Radical metadata with multi-language meanings
  - Stroke count and frequency tracking

- **Words Module**
  - Multi-language word support (zh-TW, en, ja, ko)
  - Language-specific metadata (pinyin, phonetics)
  - Word frequency and level classification
  - Audio pronunciation support
  - Radical decomposition for Chinese characters

- **Decks Module**
  - Create custom flashcard decks
  - Public and private deck visibility
  - Add/remove words from decks
  - Deck statistics and progress tracking

- **Study Module**
  - Spaced Repetition System (SRS) using SuperMemo-2 algorithm
  - Study session management
  - Progress tracking with quality ratings (0-5)
  - Next review date calculation
  - Mastery level tracking

- **Upload Module**
  - Audio file upload for word pronunciations
  - Multer configuration with file validation
  - Local storage (S3-ready architecture)

- **Database**
  - Prisma ORM integration
  - PostgreSQL database
  - Redis caching layer
  - Database seeding script

- **API Documentation**
  - Swagger/OpenAPI documentation at `/api/docs`
  - DTO validation with class-validator
  - Request/response examples

- **Security**
  - Helmet.js for HTTP headers
  - CORS configuration
  - Input validation pipes
  - Language validation for multi-language support

- **DevOps**
  - Docker support with multi-stage builds
  - Docker Compose for local development
  - Environment variable configuration
  - Production-ready setup

### Security

- Implemented JWT secret key authentication
- Added password hashing with bcrypt (cost factor: 10)
- Enabled CORS with configurable origins
- Added Helmet.js security headers
- Input sanitization and validation on all endpoints

### Documentation

- API documentation with Swagger
- Database schema documentation
- Setup and deployment guides
- Environment configuration examples

## [0.0.0] - Initial Setup

### Added

- Project scaffolding with NestJS CLI
- Basic project structure
- ESLint and Prettier configuration
- TypeScript configuration
- Testing setup with Jest

---

## Version History

- **0.0.1** - Initial production-ready release with core features
- **0.0.0** - Project initialization

## Migration Guide

No migrations required for initial version.

## Contributors

- Development Team - Initial work

## License

UNLICENSED - Private project
