# WxLingua Documentation

Welcome to the WxLingua documentation! This guide will help you understand, use, and contribute to the platform.

## 📚 Table of Contents

### Getting Started

- [Quick Start Guide](GETTING_STARTED.md) - Get up and running in 5 minutes
- [Architecture Overview](ARCHITECTURE.md) - Understand the system design
- [Development Guide](DEVELOPMENT.md) - Set up your development environment

### For Users

- [User Guide](GETTING_STARTED.md#key-features) - How to use WxLingua effectively
- Study Tips - Best practices for language learning (coming soon)
- FAQ - Frequently asked questions (coming soon)

### For Developers

- [API Documentation](API.md) - Complete API reference
- [Database Schema](DATABASE.md) - Database structure and relationships
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project
- [Development Workflow](DEVELOPMENT.md#development-workflow) - Daily development process

### For DevOps

- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [Monitoring](DEPLOYMENT.md#monitoring--logging) - System monitoring setup
- [Backup & Recovery](DATABASE.md#backup--recovery) - Data backup strategies

## 🚀 Quick Links

### Running the Application

**Development:**

```bash
# With Docker
docker-compose up -d

# Manual
cd backend && npm run start:dev
cd frontend && npm run dev
```

**Production:**

```bash
docker-compose -f docker-compose.yml up -d
```

### Common Commands

**Backend:**

```bash
# Database
npx prisma db push          # Apply schema changes
npx prisma db seed          # Seed database
npx prisma studio           # Open database GUI
npx prisma migrate dev      # Create migration

# Development
npm run start:dev           # Start dev server
npm run test               # Run tests
npm run lint               # Lint code
```

**Frontend:**

```bash
npm run dev                 # Start dev server
npm run build              # Build for production
npm run typecheck          # Type check
npm run lint               # Lint code
```

**Docker:**

```bash
docker-compose ps          # Check status
docker-compose logs -f     # View logs
docker-compose restart     # Restart services
docker-compose down        # Stop services
```

## 📖 Documentation Structure

```
docs/
├── README.md              # This file
├── GETTING_STARTED.md     # Quick start guide
├── ARCHITECTURE.md        # System architecture
├── API.md                 # API documentation
├── DATABASE.md            # Database schema
├── DEVELOPMENT.md         # Development guide
├── DEPLOYMENT.md          # Deployment guide
├── CONTRIBUTING.md        # Contributing guidelines
└── assets/                # Images and diagrams
```

## 🎯 Learning Paths

### I want to use WxLingua

1. Read [Getting Started](GETTING_STARTED.md)
2. Create an account
3. Start studying!

### I want to contribute code

1. Read [Getting Started](GETTING_STARTED.md)
2. Read [Development Guide](DEVELOPMENT.md)
3. Read [Contributing Guidelines](CONTRIBUTING.md)
4. Pick an issue and start coding!

### I want to deploy WxLingua

1. Read [Architecture Overview](ARCHITECTURE.md)
2. Read [Deployment Guide](DEPLOYMENT.md)
3. Follow deployment checklist
4. Set up monitoring

### I want to integrate with the API

1. Read [API Documentation](API.md)
2. Get API credentials
3. Review examples
4. Start building!

## 🏗️ System Overview

### Technology Stack

**Backend:**

- NestJS 11 (Node.js framework)
- PostgreSQL 16 (Database)
- Prisma 6 (ORM)
- Redis 7 (Cache)
- JWT (Authentication)

**Frontend:**

- Next.js 15 (React framework)
- React 19 (UI library)
- TanStack Query (Data fetching)
- Tailwind CSS 4 (Styling)

**DevOps:**

- Docker & Docker Compose
- Coolify (Reverse proxy & orchestration)
- Let's Encrypt (SSL)

### Key Features

1. **Spaced Repetition System** - Optimized learning schedule
2. **Radical Decomposition** - Understand Chinese characters
3. **Multi-language Support** - Learn multiple languages
4. **Custom Decks** - Organize your learning
5. **Progress Tracking** - Monitor your improvement
6. **Audio Pronunciations** - Learn correct pronunciation
7. **Dictionary + Handwriting Input** - Search 124k+ entries by text or strokes
8. **Social Learning** - Friends and direct messaging

## 📊 Database Schema

```
User ──┬── UserWord (SRS data)
   └── Deck ──── DeckCard ──── Word ──── WordRadical ──── Radical

User ──┬── FriendRequest
   ├── Friendship
   └── MessageConversation ──── Message
```

See [Database Documentation](DATABASE.md) for details.

## 🔌 API Endpoints

**Authentication:**

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login

**Words:**

- `GET /words` - List words
- `GET /words/:id` - Get word details
- `POST /words` - Create word (admin)

**Decks:**

- `GET /decks` - List decks
- `POST /decks` - Create deck
- `POST /decks/:id/cards` - Add cards

**Dictionary (Public):**

- `GET /api/dictionary/search` - Search dictionary
- `GET /api/dictionary/word/:id` - Word detail
- `POST /api/dictionary/handwriting/recognize` - Recognize handwritten input

**Social:**

- `POST /friends/requests` - Send friend request
- `GET /friends` - List friends
- `GET /direct-messages/conversations` - List conversations

**Study:**

- `GET /study/session/:deckId` - Start session
- `POST /study/review` - Submit review

See [API Documentation](API.md) for complete reference.

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Find an issue** or create one
2. **Fork the repository**
3. **Create a branch** (`git checkout -b feature/amazing`)
4. **Make changes** and commit
5. **Push to branch** (`git push origin feature/amazing`)
6. **Open a Pull Request**

See [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(words): add audio upload
fix(auth): correct token expiration
docs(api): update endpoint docs
style(frontend): format code
refactor(study): improve SRS algorithm
test(decks): add unit tests
chore(deps): update dependencies
```

## 🐛 Reporting Issues

Found a bug? Please report it!

1. Check if issue already exists
2. Create new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots (if applicable)

## 💬 Community

- **Discord**: [Join our community](https://discord.gg/wxlingua)
- **GitHub Discussions**: [Ask questions](https://github.com/wxlingua/wxlingua/discussions)
- **Twitter**: [@wxlingua](https://twitter.com/wxlingua)
- **Email**: hello@wxlingua.com

## 📄 License

- Backend: UNLICENSED (Private)
- Frontend: ISC License

See LICENSE files for details.

## 🙏 Acknowledgments

WxLingua is built with:

- [NestJS](https://nestjs.com/)
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query)

Special thanks to:

- SuperMemo for the SRS algorithm
- Kangxi Dictionary for radical data
- All our contributors

## 🗺️ Roadmap

### Q2 2026

- [ ] Mobile app (React Native)
- [ ] Offline support (PWA)
- [ ] Advanced analytics
- [ ] Social features
- [ ] GraphQL API

### Q3 2026

- [ ] AI-powered recommendations
- [ ] Speech recognition
- [ ] Gamification
- [ ] Collaborative decks
- [ ] API v2

### Q4 2026

- [ ] Multiple SRS algorithms
- [ ] Custom themes
- [ ] Export/import
- [ ] Third-party integrations
- [ ] Premium features

## 📞 Support

Need help?

- **Documentation**: You're reading it!
- **API Docs**: http://localhost:3000/api/docs
- **GitHub Issues**: [Report bugs](https://github.com/wxlingua/wxlingua/issues)
- **Email**: support@wxlingua.com
- **Discord**: [Get help from community](https://discord.gg/wxlingua)

---

<div align="center">

**Made with ❤️ by the WxLingua Team**

[Website](https://wxlingua.com) • [GitHub](https://github.com/wxlingua/wxlingua) • [Discord](https://discord.gg/wxlingua)

</div>
