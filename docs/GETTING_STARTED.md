# Getting Started with WxLingua

Welcome to WxLingua! This guide will help you get started quickly.

## What is WxLingua?

WxLingua is a comprehensive language learning platform that uses:

- **Spaced Repetition** to optimize your learning
- **Radical Decomposition** to understand Chinese characters
- **Multi-language Support** for various languages
- **Custom Decks** to organize your learning

## Quick Start (5 minutes)

### Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/wxlingua.git
cd wxlingua

# 2. Copy environment file
cp .env.example .env

# 3. Start everything
docker-compose up -d

# 4. Wait for services to be ready (~30 seconds)
docker-compose logs -f

# 5. Open in browser
# Frontend: http://localhost:3001
# Backend API: http://localhost:3000
# API Docs: http://localhost:3000/api/docs
```

### Option 2: Manual Setup

**Backend:**

```bash
cd backend
npm install
docker-compose up -d postgres redis
npm run db:push
npm run start:dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3001

## First Steps

### 1. Create an Account

Navigate to http://localhost:3001/register and create an account.

### 2. Explore Radicals

Visit the Radicals page to see the 214 Kangxi radicals and their extended variants.

### 3. Browse Words

Check out the Words library with multi-language vocabulary.

### 4. Create Your First Deck

1. Go to Decks page
2. Click "Create New Deck"
3. Add a name and description
4. Start adding words

### 5. Start Studying

1. Select a deck
2. Click "Start Study Session"
3. Rate each card (0-5) based on how well you remember
4. The system will automatically schedule reviews

## Key Features

### Spaced Repetition System (SRS)

WxLingua uses the SuperMemo-2 algorithm:

- **New cards**: Shown immediately
- **Learning cards**: Short intervals (1-6 days)
- **Young cards**: Medium intervals (6-21 days)
- **Mature cards**: Long intervals (21+ days)

Rate your recall:

- `0`: Complete blackout
- `1`: Incorrect, but remembered
- `2`: Incorrect, but easy
- `3`: Correct, difficult
- `4`: Correct, hesitation
- `5`: Perfect recall

### Radical Decomposition

For Chinese characters:

- See how each character is built from radicals
- Learn radical meanings to understand character semantics
- Filter words by radical

### Multi-language Support

Currently supports:

- **zh-TW**: Traditional Chinese with pinyin
- **en**: English with phonetics
- **ja**: Japanese with romaji
- **ko**: Korean with romanization

## Common Tasks

### Adding Words to a Deck

```
1. Go to Decks
2. Select your deck
3. Click "Add Words"
4. Search and select words
5. Click "Add Selected"
```

### Studying Due Cards

```
1. Go to Study
2. Select a deck
3. Review cards as they appear
4. Rate each card
5. Session ends when all due cards are reviewed
```

### Viewing Progress

```
1. Go to Dashboard
2. See your statistics:
   - Total cards studied
   - Cards due today
   - Mastery levels
   - Study streak
```

## Tips for Effective Learning

### Daily Routine

1. **Morning**: Review due cards (15-30 min)
2. **Afternoon**: Learn new words (10-20 min)
3. **Evening**: Quick review session (5-10 min)

### Rating Strategy

- Be honest with your ratings
- Use `3` if you had to think hard
- Use `5` only for instant recall
- Don't be afraid to use `0-1` for difficult words

### Deck Organization

- **By Level**: HSK1, HSK2, etc.
- **By Topic**: Food, Travel, Business
- **By Source**: Textbook, Movie, News
- **Mixed**: Random words you want to learn

### Study Load

- Start with 10-20 new words per day
- Adjust based on review load
- Quality over quantity
- Consistency is key

## Keyboard Shortcuts

| Shortcut | Action                       |
| -------- | ---------------------------- |
| `Space`  | Show answer                  |
| `0-5`    | Rate card                    |
| `→`      | Next card                    |
| `←`      | Previous card (if available) |
| `P`      | Play audio                   |

## Troubleshooting

### Can't login?

- Check email/password
- Try password reset (coming soon)
- Clear browser cache

### Cards not showing?

- Make sure you have added words to deck
- Check if cards are due (Dashboard > Due Cards)
- Refresh the page

### Audio not playing?

- Check browser audio permissions
- Ensure audio file exists
- Try different browser

### Slow performance?

- Clear browser cache
- Check internet connection
- Restart Docker containers

## Getting Help

- **Documentation**: [docs/](docs/)
- **API Docs**: http://localhost:3000/api/docs
- **Issues**: [GitHub Issues](https://github.com/wxlingua/wxlingua/issues)
- **Discord**: [Join our community](https://discord.gg/wxlingua)
- **Email**: support@wxlingua.com

## Next Steps

- Read the [Development Guide](docs/DEVELOPMENT.md)
- Check the [API Documentation](docs/API.md)
- Learn about [Architecture](docs/ARCHITECTURE.md)
- Contribute to the project - [Contributing Guide](docs/CONTRIBUTING.md)

## Useful Links

- **Repository**: https://github.com/wxlingua/wxlingua
- **Documentation**: https://docs.wxlingua.com
- **Website**: https://wxlingua.com
- **Blog**: https://blog.wxlingua.com

---

**Happy Learning! 🎉📚**
