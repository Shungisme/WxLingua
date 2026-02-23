import type { Word } from "./Word";

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

export interface StudySessionRequest {
  wordId: string;
  correct: boolean;
  timeSpent: number;
}

export interface NextCardsParams {
  deckId?: string;
  limit?: number;
}
