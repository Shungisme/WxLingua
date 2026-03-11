# Changelog

All notable changes to the WxLingua Frontend Application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Progressive Web App (PWA) support
- Offline study mode
- Dark mode theme
- Advanced search and filters
- Study analytics dashboard
- Mobile app with React Native
- Gamification features

## [0.0.2] - 2026-03-11

### Added

- **Study Mode Split (Learn vs Review)**
  - Clicking "Study" always loads **all cards** (`mode=learn`) — no SRS blocking
  - Clicking "Review X" loads only **due cards** (`mode=review`)
  - `dueCount` computed client-side on deck detail page from existing card data
  - `dueCount` returned from backend on deck list page for per-deck badges
  - Study session and study page updated to pass `mode` through query params
  - Study page title and description adapt to current mode

- **Typing Practice Mode** (`/decks/[id]/study?mode=type`)
  - Shows the meaning of a word; user must type the correct word
  - Optional reading hint (pinyin / phonetic) toggle per card
  - Exact-match check with case-insensitive fallback
  - Correct / Wrong / Skipped feedback with the answer revealed on error
  - Enter key to check answer and advance; Skip button
  - Progress bar + running score (correct / wrong)
  - Round summary screen with restart option

- **Matching Game Mode** (`/decks/[id]/study?mode=match`)
  - Displays a shuffled grid of word tiles and meaning tiles (6 pairs per round)
  - Click a word tile then a meaning tile to attempt a match
  - Correct match: both tiles turn green and are removed from play
  - Wrong match: both tiles flash red for 700 ms then reset
  - Clicking the same tile again deselects it
  - Clicking a tile of the same kind (word→word) swaps the selection
  - Automatic round advancement when all pairs are matched
  - Reshuffle button to randomise the current round
  - Game-over screen with total mistakes count and play-again option

- **Practice Modes Section on Deck Detail Page**
  - New "Practice modes" section above the card grid
  - **Typing** button: see meaning → type the word
  - **Matching** button: pair words with their meanings
  - Only shown when the deck has at least one card

- **Flashcard & Deck Management** (NEW)
  - **Add to Deck from Dictionary**
    - BookmarkPlus button on every dictionary result card
    - Quick add words to personal flashcard decks
    - Modal dialog for deck selection
    - Success/error notifications
  - **Deck Creation**
    - Create personal flashcard decks
    - Set deck name, description, language
    - Public/private deck visibility toggle
    - Quick create from Add to Deck dialog
  - **Deck Management Page**
    - Tabs: "My Decks" | "Public Decks"
    - View personal decks vs community decks
    - Create deck button on My Decks tab
    - Empty states with helpful prompts
    - Grid layout with deck cards
  - **Dialog Components**
    - Reusable Dialog base component
    - CreateDeckDialog with form validation
    - AddToDeckDialog with deck selection
    - Keyboard navigation (Escape to close)
    - Click outside to close
    - Backdrop blur effect

- **Dictionary Feature**
  - Dictionary search page with 124,000+ Chinese words
  - Multi-type search (character, pinyin, meaning, all)
  - Real-time search with URL params
  - **Text-to-Speech for pronunciation**
    - Browser-based TTS using Web Speech API
    - Chinese Mandarin pronunciation (zh-CN)
    - Hybrid audio system: uploaded audio files or TTS fallback
    - Speaker icon on result cards and suggestions
    - Visual feedback (pulse animation) when speaking
    - Configurable speech rate optimized for Chinese (0.8-0.9)
  - **Autocomplete suggestions with debounce**
    - Live suggestions dropdown as user types
    - 300ms debounce to optimize API calls
    - Keyboard navigation (Arrow Up/Down, Enter, Escape)
    - Click to select suggestion
    - Shows up to 8 relevant suggestions
    - Displays character, pinyin, and first meaning
    - Inline speaker icon for pronunciation without selection
  - Dictionary result cards with traditional/simplified characters
  - Pinyin display with tone marks
  - Multiple meanings display (up to 3 preview)
  - Dictionary API integration
  - Type-safe DictionaryApi class
  - Client-side search bar component
  - Search type filters (全部, 字符, 拼音, 意思)
  - Responsive grid layout for results
  - Loading skeletons for better UX
  - Empty state and error handling
  - Navigation link in sidebar

- **Custom React Hooks**
  - `useTextToSpeech` hook for Web Speech API integration
    - Browser compatibility detection
    - Voice loading and language matching
    - Configurable rate, pitch, and volume
    - Speaking state tracking
    - Automatic cleanup on unmount
  - `useDebounce` hook for optimizing search and API calls
    - TypeScript generic support for type safety
    - Configurable delay parameter (default: 500ms)

## [1.0.0] - 2026-02-22

### Added

- **Authentication Pages**
  - Login page with email/password
  - Registration page with validation
  - JWT token management
  - Protected route middleware

- **Dashboard**
  - User study statistics
  - Recent decks overview
  - Progress tracking widgets
  - Quick action buttons

- **Decks Management**
  - Browse all decks (public and private)
  - Create new decks
  - Edit deck details
  - Delete decks
  - Deck card component with statistics
  - View individual deck details with word list

- **Words Management**
  - Browse word library
  - Word card component with details
  - Multi-language word display
  - Audio pronunciation playback
  - Word detail view with radical breakdown
  - Language-specific metadata display

- **Radicals View**
  - Browse all radicals
  - Radical tree visualization
  - Filter by stroke count
  - Interactive radical selection
  - Related words display

- **Study Session**
  - Interactive flashcard interface
  - Spaced Repetition System (SRS)
  - Quality rating (0-5)
  - Progress tracking
  - Session statistics
  - Card flip animation

- **UI Components**
  - Custom button component
  - Card components
  - Input fields
  - Badge component
  - Progress ring visualization
  - Skeleton loaders
  - Responsive navbar
  - Sidebar navigation
  - Footer component

- **Routing**
  - Next.js App Router
  - Route groups for auth and dashboard
  - Dynamic routes for decks and words
  - 404 Not Found page

- **State Management**
  - TanStack Query for data fetching
  - React Query Provider setup
  - Optimistic updates
  - Cache management

- **Styling**
  - Tailwind CSS v4 integration
  - Custom design system
  - Responsive design
  - Smooth animations with Framer Motion
  - Form styling with @tailwindcss/forms

- **API Integration**
  - Axios client configuration
  - API wrapper functions
  - Error handling
  - Request/response interceptors
  - TypeScript types for API responses

- **Performance**
  - Next.js Image optimization
  - Code splitting
  - Lazy loading components
  - Prefetching strategies

### Changed

- Migrated to Next.js 15
- Updated to React 19
- Upgraded Tailwind CSS to v4

### Security

- Environment variables for API URL
- Secure token storage
- CORS-compliant requests
- Input validation on forms

### Developer Experience

- TypeScript strict mode
- ESLint configuration
- Prettier integration
- Type checking script
- Hot module replacement

## [0.0.0] - Initial Setup

### Added

- Next.js project initialization
- Basic project structure
- Configuration files
- Development tools setup

---

## Version History

- **0.0.2** - Dictionary, study modes (learn/review/type/match), deck management dialogs, TTS, custom hooks
- **1.0.0** - Initial production-ready release with full features
- **0.0.0** - Project initialization

## Breaking Changes

None for initial release.

## Migration Guide

No migrations required for initial version.

## Known Issues

- Audio playback may require user interaction on some browsers
- Safari may have issues with some CSS animations

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributors

- Frontend Team - Initial work

## License

ISC License
