import type { Radical } from "./Radical";

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

export interface WordListParams {
  language?: string;
  level?: string;
  limit?: number;
  cursorId?: string;
  q?: string;
}
