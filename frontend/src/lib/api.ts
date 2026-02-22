import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// ─── Auth ───────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post<{ access_token: string; user: User }>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ access_token: string; user: User }>('/auth/login', data),
  me: () => api.get<User>('/auth/me'),
};

// ─── Words ──────────────────────────────────────────
export const wordsApi = {
  list: (params?: { language?: string; level?: string; limit?: number; cursorId?: string }) =>
    api.get<Word[]>('/words', { params }),
  getById: (id: string) => api.get<WordDetail>(`/words/${id}`),
};

// ─── Radicals ───────────────────────────────────────
export const radicalsApi = {
  list: (params?: { limit?: number }) => api.get<Radical[]>('/radicals', { params }),
  getById: (id: string) => api.get<Radical>(`/radicals/${id}`),
};

// ─── Decks ──────────────────────────────────────────
export const decksApi = {
  list: (params?: { public?: boolean }) => api.get<Deck[]>('/decks', { params }),
  getById: (id: string) => api.get<DeckDetail>(`/decks/${id}/cards`),
  create: (data: { name: string; description?: string; languageCode?: string; isPublic?: boolean }) =>
    api.post<Deck>('/decks', data),
  addWords: (deckId: string, wordIds: string[]) =>
    api.post(`/decks/${deckId}/words`, { wordIds }),
};

// ─── Study ──────────────────────────────────────────
export const studyApi = {
  nextCards: (params?: { deckId?: string; limit?: number }) =>
    api.get<StudyCard[]>('/study/next', { params }),
  logSession: (data: { wordId: string; correct: boolean; timeSpent: number }) =>
    api.post('/study/session', data),
  stats: () => api.get<StudyStats>('/study/stats'),
};

// ─── Types ──────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
}

export interface Radical {
  id: string;
  char: string;
  variant: string;
  strokeCount: number;
  meaning: Record<string, string>;
  imageUrl?: string;
  frequency: number;
  createdAt: string;
}

export interface Word {
  id: string;
  languageCode: string;
  word: string;
  level?: string;
  metadata?: Record<string, unknown>;
  audioUrl?: string;
  createdAt: string;
}

export interface WordDetail extends Word {
  wordRadicals: { position: number; radical: Radical }[];
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  languageCode?: string;
  isPublic: boolean;
  cardCount: number;
  createdAt: string;
}

export interface DeckDetail extends Deck {
  deckWords: { position: number; word: Word }[];
}

export interface StudyCard {
  id: string;
  progress: number;
  streak: number;
  nextReview: string;
  word: Word;
}

export interface StudyStats {
  totalLearned: number;
}
