export class DictionaryWordDto {
  id: string;
  word: string;
  languageCode: string;
  metadata: {
    simplified?: string;
    pinyin?: string;
    meanings?: string[];
    [key: string]: any;
  };
  frequency?: number;
  level?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class DictionaryRadicalDto {
  id: string;
  char: string;
  variant: string;
  strokeCount: number;
  meaning: {
    pinyin: string;
    en: string;
  };
  frequency: number;
}

export class SearchResultDto {
  words: DictionaryWordDto[];
  total: number;
  query: string;
  searchType: string;
}
