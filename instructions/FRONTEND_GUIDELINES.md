# Frontend Development Guidelines

## Next.js & React Best Practices for WxLingua

### Project Structure

```
frontend/src/
├── app/                    # App Router (Next.js 15)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   ├── (auth)/            # Route group: Auth pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   └── (dashboard)/       # Route group: Dashboard
│       ├── layout.tsx     # Dashboard layout
│       ├── dashboard/
│       ├── decks/
│       ├── words/
│       └── study/
├── components/
│   ├── features/          # Domain-specific components
│   │   ├── flashcard.tsx
│   │   ├── word-card.tsx
│   │   └── study-session.tsx
│   ├── layout/            # Layout components
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   └── ui/                # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
└── lib/
    ├── api.ts             # API client
    ├── utils.ts           # Utility functions
    └── types.ts           # TypeScript types
```

### File-Based Routing (App Router)

**Page Structure:**

```typescript
// app/words/page.tsx
export default function WordsPage() {
  return <div>Words Page</div>;
}

// app/words/[id]/page.tsx
export default function WordDetailPage({
  params
}: {
  params: { id: string }
}) {
  return <div>Word {params.id}</div>;
}

// app/decks/[id]/words/page.tsx - Nested route
export default function DeckWordsPage({
  params
}: {
  params: { id: string }
}) {
  return <div>Words in Deck {params.id}</div>;
}
```

**Layout Files:**

```typescript
// app/layout.tsx - Root layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// app/(dashboard)/layout.tsx - Dashboard layout
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

### Component Patterns

**Functional Components with TypeScript:**

```typescript
// components/features/word-card.tsx
interface WordCardProps {
  word: {
    id: string;
    word: string;
    languageCode: string;
    audioUrl?: string;
  };
  onClick?: () => void;
}

export function WordCard({ word, onClick }: WordCardProps) {
  return (
    <div
      className="rounded-lg border p-4 hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <h3 className="text-xl font-bold">{word.word}</h3>
      <p className="text-gray-500">{word.languageCode}</p>
      {word.audioUrl && <AudioPlayer url={word.audioUrl} />}
    </div>
  );
}
```

**Server vs Client Components:**

```typescript
// ✅ Server Component (default in App Router)
// app/words/page.tsx
async function WordsPage() {
  const words = await getWords(); // Direct DB or API call
  return <WordList words={words} />;
}

// ✅ Client Component (with 'use client')
// components/features/flashcard.tsx
'use client';

import { useState } from 'react';

export function FlashCard({ word }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div onClick={() => setFlipped(!flipped)}>
      {flipped ? word.meaning : word.word}
    </div>
  );
}
```

### Data Fetching with TanStack Query

**Setup Provider:**

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Query Example:**

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function WordsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['words'],
    queryFn: () => api.get('/words'),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data.map(word => (
        <WordCard key={word.id} word={word} />
      ))}
    </div>
  );
}
```

**Mutation Example:**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function CreateDeckForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateDeckData) => api.post('/decks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
    },
  });

  const handleSubmit = (data: CreateDeckData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Deck'}
      </button>
    </form>
  );
}
```

### API Client

**Axios Setup:**

```typescript
// lib/api.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const api = {
  get: <T>(url: string, params?: any) =>
    apiClient.get<T>(url, { params }).then((res) => res.data),

  post: <T>(url: string, data?: any) =>
    apiClient.post<T>(url, data).then((res) => res.data),

  put: <T>(url: string, data?: any) =>
    apiClient.put<T>(url, data).then((res) => res.data),

  delete: <T>(url: string) => apiClient.delete<T>(url).then((res) => res.data),
};
```

### Styling with Tailwind CSS

**Component Styling:**

```typescript
export function Button({
  children,
  variant = 'primary',
  ...props
}) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors ";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

**Using clsx for Conditional Classes:**

```typescript
import { clsx } from 'clsx';

export function Card({ isActive, children }) {
  return (
    <div className={clsx(
      'rounded-lg border p-4',
      isActive && 'border-blue-500 bg-blue-50',
      !isActive && 'border-gray-200'
    )}>
      {children}
    </div>
  );
}
```

**Responsive Design:**

```typescript
export function Grid({ children }) {
  return (
    <div className="
      grid gap-4
      grid-cols-1
      sm:grid-cols-2
      md:grid-cols-3
      lg:grid-cols-4
    ">
      {children}
    </div>
  );
}
```

### State Management

**Local State (useState):**

```typescript
'use client';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

**Form State:**

```typescript
'use client';

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Loading & Error States

**Loading Skeleton:**

```typescript
export function WordCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

export function WordsPage() {
  const { data, isLoading } = useQuery({ ... });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <WordCardSkeleton key={i} />)}
      </div>
    );
  }

  return <WordList words={data} />;
}
```

**Error Boundary:**

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### Performance Optimization

**Memoization:**

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memo component
export const WordCard = memo(({ word }) => {
  return <div>{word.word}</div>;
});

// Memo value
export function WordList({ words }) {
  const sortedWords = useMemo(() => {
    return words.sort((a, b) => a.frequency - b.frequency);
  }, [words]);

  return <div>{sortedWords.map(...)}</div>;
}

// Memo callback
export function Parent() {
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);

  return <Child onClick={handleClick} />;
}
```

**Dynamic Imports:**

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Client-side only
});

export function Page() {
  return (
    <div>
      <HeavyComponent />
    </div>
  );
}
```

### TypeScript Types

**Define clear interfaces:**

```typescript
// lib/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}

export interface Word {
  id: string;
  word: string;
  languageCode: "zh-TW" | "en" | "ja" | "ko";
  frequency?: number;
  audioUrl?: string;
  metadata?: Record<string, any>;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  visibility: "PUBLIC" | "PRIVATE";
  userId: string;
  wordCount: number;
}
```

### Animations with Framer Motion

```typescript
import { motion } from 'framer-motion';

export function FlashCard({ word }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card"
    >
      {word.word}
    </motion.div>
  );
}
```

## Checklist for New Features

- [ ] Create page in appropriate directory
- [ ] Define TypeScript interfaces
- [ ] Implement data fetching with TanStack Query
- [ ] Add loading and error states
- [ ] Style with Tailwind CSS
- [ ] Make responsive (mobile-first)
- [ ] Add animations if needed
- [ ] Optimize performance (memo, dynamic import)
- [ ] Test on different screen sizes
- [ ] Check accessibility

---

**Follow these guidelines for consistent, performant frontend code.**
