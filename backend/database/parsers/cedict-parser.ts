/**
 * CC-CEDICT Parser
 *
 * Parses the CC-CEDICT Chinese-English dictionary file (cedict_ts.u8)
 * Format: Traditional Simplified [pinyin] /meaning1/meaning2/.../
 *
 * Example:
 * 學習 学习 [xue2 xi2] /to study; to learn/
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { convertPinyinTones, normalizePinyin } from '../utils/pinyin-converter';

export interface CedictEntry {
  id: string;
  traditional: string;
  simplified: string;
  pinyin: string;
  meanings: string[];
}

export interface WordData {
  id: string;
  languageCode: string;
  word: string;
  metadata: {
    simplified: string;
    pinyin: string;
    pinyinNormalized: string; // Accent-free version for search
    meanings: string[];
  };
}

/**
 * Parse a single line from cedict file
 */
export function parseCedictLine(line: string): CedictEntry | null {
  // Skip comments and empty lines
  if (!line || line.startsWith('#') || line.startsWith('%')) {
    return null;
  }

  // Regex pattern: Traditional Simplified [pinyin] /meanings/
  const pattern = /^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\/$/;
  const match = line.match(pattern);

  if (!match) {
    return null;
  }

  const [, traditional, simplified, pinyin, meaningsStr] = match;

  // Split meanings by / and clean up
  const meanings = meaningsStr
    .split('/')
    .map((m) => m.trim())
    .filter((m) => m.length > 0);

  // Generate unique ID based on traditional character
  const id =
    'zh_' +
    crypto.createHash('md5').update(traditional).digest('hex').substring(0, 12);

  return {
    id,
    traditional,
    simplified,
    pinyin,
    meanings,
  };
}

/**
 * Convert cedict entry to Word database format
 */
export function cedictToWord(entry: CedictEntry): WordData {
  const tonedPinyin = convertPinyinTones(entry.pinyin);
  return {
    id: entry.id,
    languageCode: 'zh-TW', // Traditional Chinese
    word: entry.traditional,
    metadata: {
      simplified: entry.simplified,
      pinyin: tonedPinyin, // Toned pinyin for display
      pinyinNormalized: normalizePinyin(tonedPinyin), // Normalized for search
      meanings: entry.meanings,
    },
  };
}

/**
 * Read and parse cedict file
 * @param limit - Maximum number of entries to parse (0 = all)
 */
export function parseCedictFile(
  filePath: string,
  limit: number = 0,
): WordData[] {
  const words: WordData[] = [];

  if (!fs.existsSync(filePath)) {
    throw new Error(`CEDICT file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  // Split by both \r\n and \n to handle Windows and Unix line endings
  const lines = content.split(/\r?\n/);

  let count = 0;
  for (const line of lines) {
    const entry = parseCedictLine(line);
    if (entry) {
      words.push(cedictToWord(entry));
      count++;

      if (limit > 0 && count >= limit) {
        break;
      }
    }
  }

  return words;
}

/**
 * Get the default cedict file path
 */
export function getDefaultCedictPath(): string {
  return path.join(__dirname, '..', 'dictionaries', 'cedict_ts.u8');
}
