import type { Word } from "./Word";

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
