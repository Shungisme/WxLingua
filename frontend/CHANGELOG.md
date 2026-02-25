# Changelog

All notable changes to the WxLingua Frontend Application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

### Planned

- Progressive Web App (PWA) support
- Offline study mode
- Dark mode theme
- Advanced search and filters
- Study analytics dashboard
- Mobile app with React Native
- Gamification features

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

- **Unreleased** - Dictionary feature with 124k+ Chinese words
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
