import type { CardState } from "./Study";

export interface Deck {
  id: string;
  name: string;
  description?: string;
  languageCode?: string;
  isPublic: boolean;
  cardCount: number;
  createdAt: string;
}

/** A user-customisable card inside a deck (separate from the dictionary Word) */
export interface DeckCard {
  id: string;
  deckId: string;
  sourceWordId?: string | null;
  term: string;
  meaning?: Record<string, string> | null;
  pronunciation?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  notes?: string | null;
  position: number;
  // SRS state
  state: CardState;
  nextReview: string;
  progress: number;
  streak: number;
  stability: number;
  difficulty: number;
  lapses: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeckDetail extends Deck {
  deckCards: DeckCard[];
}

export interface DeckListParams {
  public?: boolean;
}

export interface CreateDeckRequest {
  name: string;
  description?: string;
  languageCode?: string;
  isPublic?: boolean;
}

export interface AddWordsToDeckRequest {
  wordIds: string[];
}
