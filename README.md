# WxLingua - Language Learning Flashcard Platform

<div align="center">

<img src="docs/assets/logo.png" alt="WxLingua Logo" width="120" />

**A comprehensive flashcard platform for language learning with radical decomposition and spaced repetition**

[![NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E?logo=nestjs)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-000000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED?logo=docker)](https://www.docker.com/)

</div>

## 📋 Overview

**Live App**: https://wxlingua.shung.site

WxLingua is a modern, full-stack language learning platform that helps users master vocabulary through:

- **Spaced Repetition System (SRS)**: FSRS scheduling for adaptive review intervals
- **Radical Decomposition**: Break down Chinese characters into their fundamental components
- **Multi-language Support**: zh-TW (Traditional Chinese), English, Japanese, Korean
- **Custom Decks**: Create and share personalized flashcard collections
- **Dictionary + Handwriting Input**: Search 124k+ entries and recognize handwritten characters
- **Social Learning**: Friends, direct messages, and conversation management
- **Audio Pronunciations**: Native speaker recordings for accurate pronunciation
- **Progress Tracking**: Detailed statistics and mastery levels

## 🏗️ Architecture

```
WxLingua/
├── backend/          # NestJS REST API
│   ├── src/
│   │   ├── modules/  # Feature modules (auth, dictionary, decks, study, friends, chat, ...)
│   │   ├── core/     # Shared DTOs, pipes, interceptors, filters
│   │   └── shared/   # Shared constants, utils, types
│   └── prisma/       # Database schema & migrations
│
├── frontend/         # Next.js 15 + React 19
│   └── src/
│       ├── app/      # App Router pages
│       │   ├── (auth)/      # Login/Register
│       │   └── (dashboard)/ # Main app
│       ├── components/
│       │   ├── features/    # Domain components
│       │   ├── layout/      # Layout components
│       │   └── ui/          # Reusable UI
│       └── lib/      # API client & utils
│
└── docs/             # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Docker** & **Docker Compose**
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/wxlingua.git
cd wxlingua
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Important: Change JWT_SECRET and DB_PASSWORD in production!
```

### 3. Start with Docker Compose (Recommended)

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# The application will be available at:
# Frontend: http://localhost:3001
# Backend API: http://localhost:3000
# API Docs: http://localhost:3000/api/docs
```

### 4. Manual Setup (Development)

#### Backend

```bash
cd backend

# Install dependencies
npm install

# Start database services
docker-compose up -d postgres redis

# Setup database (migrations + radicals + full dictionary import)
npm run setup-db

# Start development server
npm run start:dev
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📚 Features

### Authentication & Authorization

- 🔐 JWT-based authentication
- 👤 User registration and login
- 🛡️ Role-based access control (User, Admin)
- 🔒 Secure password hashing with bcrypt

### Word Management

- 🌏 Multi-language word database (zh-TW, en, ja, ko)
- 📚 Public dictionary search with 124,000+ CC-CEDICT entries
- ✍️ Handwriting recognition input for Chinese lookup
- 🎤 Audio pronunciation support
- 📊 Word frequency and difficulty levels
- 🔍 Search and filter capabilities
- 🏷️ Language-specific metadata (pinyin, phonetics)

### Radical System

- 📖 214 Kangxi radicals + extended set
- 🎨 Stroke diagrams and visual guides
- 🔗 Radical-to-word relationships
- 📈 Frequency-based learning prioritization

### Deck Management

- 📚 Create custom flashcard decks
- 🌐 Public and private deck sharing
- ➕ Add/remove words from decks
- 📊 Deck statistics and progress tracking

### Study Sessions

- 🧠 Spaced Repetition System (FSRS)
- 📅 Smart review scheduling
- ⭐ Quality ratings (1-4: Again / Hard / Good / Easy)
- 📈 Progress tracking and mastery levels
- 🎯 Personalized learning paths

### Social Features

- 👥 Friend requests and friendship management
- 💬 Direct messaging and conversation list
- 🧑 User relationship states across profile/search

### Admin Features

- 👨‍💼 User management
- 📝 Content moderation
- 📊 Analytics dashboard
- 🔧 System configuration

## 🛠️ Technology Stack

### Backend

- **Framework**: NestJS 11
- **Language**: TypeScript 5
- **Database**: PostgreSQL 16
- **ORM**: Prisma 6
- **Cache**: Redis 7
- **Authentication**: JWT + Passport
- **Validation**: class-validator, class-transformer
- **API Docs**: Swagger/OpenAPI
- **Security**: Helmet, CORS

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React

### DevOps

- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions (planned)
- **Monitoring**: (planned)

## 📖 Documentation

Detailed documentation is available in the [`docs/`](docs/) directory:

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)
- [Database Schema](docs/DATABASE.md)

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests

```bash
cd frontend

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📦 Production Deployment

### Docker Deployment

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Start production services
docker-compose up -d

# Check status
docker-compose ps
```

### Environment Variables

Key environment variables for production:

```bash
# Security
JWT_SECRET=<strong-random-string>
DB_PASSWORD=<strong-password>

# URLs
CORS_ORIGIN=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
```

See [`.env.example`](.env.example) for all available options.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Changelog

See [Backend CHANGELOG](backend/CHANGELOG.md) and [Frontend CHANGELOG](frontend/CHANGELOG.md) for version history.

## 📄 License

- Backend: UNLICENSED (Private)
- Frontend: ISC License

## 👥 Team

- **Backend Team** - API & Database
- **Frontend Team** - UI & UX
- **DevOps Team** - Infrastructure

## 🙏 Acknowledgments

- Inspired by AnkiDroid and Pleco
- Radical data based on Kangxi dictionary
- Word frequency lists from various sources

## 📞 Support

- 📧 Email: support@wxlingua.com
- 💬 Discord: [Join our community](https://discord.gg/wxlingua)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/wxlingua/issues)
- 🌐 Live App: https://wxlingua.shung.site

---

<div align="center">

**Made with ❤️ by the WxLingua Team**

[Website](https://wxlingua.shung.site) • [Documentation](docs/) • [API Docs](http://localhost:3000/api/docs)

</div>
