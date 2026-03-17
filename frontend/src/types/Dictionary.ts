import type { Word } from "./Word";
import type { Radical } from "./Radical";

export type DictionarySearchType = "character" | "pinyin" | "meaning" | "all";

export interface DictionarySearchParams {
  q: string;
  type?: DictionarySearchType;
  limit?: number;
}

export interface DictionaryWord extends Word {
  metadata: {
    simplified?: string;
    pinyin?: string;
    meanings?: string[];
    [key: string]: unknown;
  };
}

export interface DictionarySearchResult {
  words: DictionaryWord[];
  total: number;
}

export interface HandwritingStroke {
  x: number[];
  y: number[];
  t: number[];
}

export interface HandwritingRecognizeRequest {
  strokes: HandwritingStroke[];
  language?: "zh-TW" | "zh-CN";
  maxCandidates?: number;
  width?: number;
  height?: number;
}

export interface HandwritingCandidate {
  text: string;
  rank: number;
}

export interface HandwritingRecognizeResponse {
  candidates: HandwritingCandidate[];
  language: string;
  processingMs: number;
}
