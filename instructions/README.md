# WxLingua AI Instructions

This directory contains context files and guidelines for AI-assisted development on the WxLingua project.

## Purpose

When working with AI coding assistants (GitHub Copilot, Claude, GPT-4, etc.), these instruction files help maintain consistency, follow best practices, and understand the project architecture.

## Directory Structure

```
instructions/
├── README.md                    # This file - Overview and usage guide
├── PROJECT_CONTEXT.md           # ✅ Overall project context, architecture, domain models
├── BACKEND_GUIDELINES.md        # ✅ NestJS patterns, DI, Prisma, testing
├── FRONTEND_GUIDELINES.md       # ✅ Next.js 15, React 19, TanStack Query, Tailwind
├── DATABASE_GUIDELINES.md       # ✅ Prisma schema, migrations, optimization
├── API_DESIGN.md                # ✅ RESTful standards, endpoints, auth, errors
├── TESTING_GUIDELINES.md        # ✅ Unit tests, E2E tests, mocking, coverage
├── CODE_STYLE.md                # ✅ TypeScript style, naming, ESLint, Prettier
└── COMMON_PATTERNS.md           # ✅ CRUD patterns, utilities, code snippets
```

**All instruction files are complete and ready to use!**

## How to Use

### For Developers

1. **Read these files before starting development**
2. **Reference specific guidelines when implementing features**
3. **Update instructions when patterns emerge**
4. **Share with team members**

### For AI Assistants

When prompting AI tools, include relevant context:

```
I'm working on the WxLingua project.

Context from instructions/PROJECT_CONTEXT.md:
[paste relevant sections]

Task: [your specific task]
```

### Integration with AI Tools

#### GitHub Copilot

Add to `.github/copilot-instructions.md`:

```markdown
See /instructions directory for project-specific guidelines
```

#### Cursor / VSCode

Create `.cursorrules` or `.vscode/settings.json`:

```json
{
  "ai.contextFiles": [
    "instructions/PROJECT_CONTEXT.md",
    "instructions/BACKEND_GUIDELINES.md"
  ]
}
```

#### Claude / ChatGPT

Use as system prompts or include in context window.

## Quick Reference

### Backend Development

- Module structure: Feature-based modules
- DI pattern: Constructor injection
- Validation: class-validator DTOs
- Error handling: NestJS exception filters
- Database: Prisma ORM
- Testing: Jest unit + E2E tests

### Frontend Development

- Framework: Next.js 15 App Router
- State: TanStack Query
- Styling: Tailwind CSS 4
- Components: Functional with TypeScript
- Routing: File-based routing
- Testing: React Testing Library (planned)

### Database

- ORM: Prisma 6
- Migrations: Prisma Migrate
- Schema: schema.prisma
- Seeding: prisma/seed.ts
- Naming: PascalCase for models

### API Design

- REST: Resource-based URLs
- Auth: JWT Bearer tokens
- Versioning: /v1/resource (planned)
- Pagination: page/limit query params
- Errors: Standard HTTP status codes

## Best Practices

1. **Always check current code** before generating new code
2. **Follow existing patterns** in the codebase
3. **Update documentation** when adding features
4. **Write tests** for new functionality
5. **Use TypeScript** strictly
6. **Follow naming conventions**
7. **Add comments** for complex logic
8. **Consider performance** implications

## Common Tasks

### Adding a New Backend Feature

1. Read `BACKEND_GUIDELINES.md`
2. Generate module: `nest g module features/my-feature`
3. Create service, controller, DTOs
4. Add validation
5. Write tests
6. Update API docs

### Adding a New Frontend Page

1. Read `FRONTEND_GUIDELINES.md`
2. Create page in `app/` directory
3. Design component structure
4. Implement data fetching
5. Add styling
6. Test responsive design

### Database Changes

1. Read `DATABASE_GUIDELINES.md`
2. Update `schema.prisma`
3. Generate migration: `npx prisma migrate dev`
4. Update seed data if needed
5. Test on development database

## Updating Instructions

When you discover a pattern or best practice:

1. Document it in the appropriate file
2. Include code examples
3. Explain the reasoning
4. Update this README if adding new files

## Version Control

These instruction files are:

- ✅ Committed to repository
- ✅ Versioned with code
- ✅ Updated as project evolves
- ✅ Reviewed in pull requests

## Support

Questions about these instructions?

- Open an issue on GitHub
- Ask in team chat
- Email: dev@wxlingua.com

## Files Summary

| File                   | Size | Purpose                                         |
| ---------------------- | ---- | ----------------------------------------------- |
| PROJECT_CONTEXT.md     | 8KB  | Overall architecture, tech stack, domain models |
| BACKEND_GUIDELINES.md  | 12KB | Complete NestJS development guide with examples |
| FRONTEND_GUIDELINES.md | 11KB | Next.js 15 & React best practices               |
| DATABASE_GUIDELINES.md | 9KB  | Prisma patterns, migrations, optimization       |
| API_DESIGN.md          | 10KB | RESTful API standards and conventions           |
| TESTING_GUIDELINES.md  | 11KB | Testing strategy and examples                   |
| CODE_STYLE.md          | 10KB | TypeScript & code formatting standards          |
| COMMON_PATTERNS.md     | 12KB | Reusable code patterns and snippets             |

**Total: 83KB of comprehensive development guidance**

## Last Updated

2024-01-15 - Complete instruction set created (8 files)
