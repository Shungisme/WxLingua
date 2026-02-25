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
