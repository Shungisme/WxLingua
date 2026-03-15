import { z } from 'zod';

export const LANGUAGE_METADATA = {
  'zh-TW': z.object({
    pinyin: z.string(),
    zhuyin: z.string().optional(),
    hsnLevel: z.string().optional(),
  }),
  en: z.object({
    phonetic: z.string(),
    partOfSpeech: z.enum(['noun', 'verb', 'adj', 'adv']),
    synonyms: z.array(z.string()).optional(),
  }),
  ja: z.object({
    readings: z.object({ on: z.array(z.string()), kun: z.array(z.string()) }),
    jlptLevel: z.enum(['N1', 'N2', 'N3', 'N4', 'N5']),
  }),
  ko: z.object({
    romaja: z.string(),
    hancha: z.string().optional(),
  }),
};

export type SupportedLanguageCode = keyof typeof LANGUAGE_METADATA;
