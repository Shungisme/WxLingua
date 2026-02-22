# Contributing to WxLingua

First off, thank you for considering contributing to WxLingua! It's people like you that make WxLingua such a great tool for language learners.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- **Be respectful**: Treat everyone with respect. Disagreements are fine, but personal attacks are not.
- **Be constructive**: Provide constructive feedback and helpful suggestions.
- **Be collaborative**: Work together to make the project better.
- **Be inclusive**: Welcome newcomers and help them get started.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

**Bug Report Template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**

- OS: [e.g. Windows, macOS, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

**Enhancement Template:**

```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Pull Requests

1. **Fork the repository** and create your branch from `main`.
2. **Follow the coding style** of the project.
3. **Write clear commit messages** following Conventional Commits.
4. **Include tests** for new features.
5. **Update documentation** as needed.
6. **Ensure all tests pass** before submitting.

## Development Process

### 1. Setup Development Environment

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed setup instructions.

```bash
# Clone your fork
git clone https://github.com/yourusername/wxlingua.git
cd wxlingua

# Add upstream remote
git remote add upstream https://github.com/wxlingua/wxlingua.git

# Create branch
git checkout -b feature/my-feature
```

### 2. Make Changes

#### Backend Changes

```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run start:dev

# Run tests
npm run test

# Check linting
npm run lint
```

#### Frontend Changes

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npm run typecheck

# Check linting
npm run lint
```

### 3. Commit Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Format: <type>(<scope>): <subject>

# Examples:
git commit -m "feat(words): add audio upload support"
git commit -m "fix(auth): correct JWT token expiration"
git commit -m "docs(api): update endpoint documentation"
git commit -m "style(frontend): format code with prettier"
git commit -m "refactor(study): improve SRS algorithm"
git commit -m "test(decks): add unit tests for deck service"
git commit -m "chore(deps): update dependencies"
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

**Scopes:**

- `auth`: Authentication
- `words`: Words module
- `radicals`: Radicals module
- `decks`: Decks module
- `study`: Study sessions
- `api`: API changes
- `frontend`: Frontend changes
- `backend`: Backend changes
- `db`: Database changes
- `docs`: Documentation

### 4. Push Changes

```bash
# Push to your fork
git push origin feature/my-feature
```

### 5. Create Pull Request

1. Go to https://github.com/wxlingua/wxlingua
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill in the template:

**Pull Request Template:**

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?

Describe the tests you ran to verify your changes.

## Checklist

- [ ] My code follows the code style of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if appropriate)

Add screenshots to help explain your changes.
```

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint rules
- Use meaningful variable names
- Add JSDoc comments for functions
- Prefer `const` over `let`
- Use async/await over promises

**Example:**

```typescript
/**
 * Calculates next review date using SuperMemo-2 algorithm
 * @param quality - User rating (0-5)
 * @param interval - Current interval in days
 * @param easeFactor - Current ease factor
 * @returns Updated SRS parameters
 */
async function calculateNextReview(
  quality: number,
  interval: number,
  easeFactor: number,
): Promise<SRSResult> {
  // Implementation
}
```

### Backend (NestJS)

- One module per feature
- Use DTOs for validation
- Use dependency injection
- Add Swagger documentation
- Handle errors properly

**Example Module Structure:**

```
words/
├── words.module.ts
├── words.service.ts
├── words.controller.ts
├── dto/
│   ├── create-word.dto.ts
│   └── update-word.dto.ts
└── words.service.spec.ts
```

### Frontend (Next.js)

- Use TypeScript
- Follow file-based routing
- Use Server Components when possible
- Extract reusable components
- Use Tailwind CSS for styling

**Component Example:**

```typescript
interface Props {
  word: Word;
  onPlay?: () => void;
}

export function WordCard({ word, onPlay }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-xl font-bold">{word.word}</h3>
      {word.audioUrl && (
        <button onClick={onPlay}>Play Audio</button>
      )}
    </div>
  );
}
```

### Database (Prisma)

- Use descriptive model names
- Add comments for complex fields
- Create migrations for schema changes
- Use appropriate field types

**Example:**

```prisma
model Word {
  id            String   @id @default(cuid())
  word          String   @unique
  languageCode  String   // ISO 639-1 language code

  // Language-specific metadata (pinyin, phonetics, etc.)
  metadata      Json?

  // Relations
  wordRadicals  WordRadical[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([languageCode])
  @@index([word])
}
```

## Testing Guidelines

### Backend Tests

```typescript
// Unit test example
describe("WordsService", () => {
  let service: WordsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [WordsService, PrismaService],
    }).compile();

    service = module.get<WordsService>(WordsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should create a word", async () => {
    const dto = { word: "學", languageCode: "zh-TW" };
    const result = await service.create(dto);
    expect(result).toHaveProperty("id");
    expect(result.word).toBe("學");
  });
});
```

### E2E Tests

```typescript
// E2E test example
describe("Words (e2e)", () => {
  it("/words (GET)", () => {
    return request(app.getHttpServer())
      .get("/words")
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments to public APIs
- Explain complex algorithms
- Document assumptions
- Include examples for complex functions

### README Updates

- Update README.md if adding new features
- Add screenshots for UI changes
- Update dependency list if needed

### API Documentation

- Update Swagger decorators
- Include request/response examples
- Document error cases

## Review Process

1. **Automated checks**: CI/CD must pass
2. **Code review**: At least one maintainer approval
3. **Testing**: Verify tests cover new code
4. **Documentation**: Ensure docs are updated
5. **Final review**: Check for breaking changes

## Release Process

Maintainers will:

1. Review and merge PR
2. Update CHANGELOG.md
3. Tag release (semantic versioning)
4. Deploy to production

## Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Thanked on our website

## Questions?

- **Discord**: [Join our community](https://discord.gg/wxlingua)
- **Email**: contributing@wxlingua.com
- **Discussions**: [GitHub Discussions](https://github.com/wxlingua/wxlingua/discussions)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project:

- Backend: UNLICENSED (Private)
- Frontend: ISC License

---

**Thank you for contributing to WxLingua! 🎉**
