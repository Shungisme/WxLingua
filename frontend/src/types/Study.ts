import type { Word } from "./Word";

export type CardState = "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
export type Rating = 1 | 2 | 3 | 4;

export interface StudyCard {
  id: string;
  /** Present when this card is a DeckCard (deck-based study) */
  cardId?: string;
  progress: number;
  streak: number;
  nextReview: string;
  word: Word;
  // SRS additional fields
  state: CardState;
  stability: number;
  difficulty: number;
  lapses: number;
}

export interface StudyStats {
  totalLearned: number;
  dueToday: number;
  totalReviews: number;
  todayReviews: number;
}

export interface DailyReviewCount {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface ForecastDay {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface StudySessionRequest {
  /** For vocabulary-based study */
  wordId?: string;
  /** For deck-card-based study */
  cardId?: string;
  rating: Rating;
  timeSpent: number;
}

export interface NextCardsParams {
  deckId?: string;
  limit?: number;
}
