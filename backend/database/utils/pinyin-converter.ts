/**
 * Pinyin Tone Converter
 * Converts numbered pinyin (e.g., "ni3 hao3") to tone-marked pinyin (e.g., "nǐ hǎo")
 */

// Tone mark lookup table: [tone1, tone2, tone3, tone4]
const TONE_MARKS: Record<string, string[]> = {
  a: ['ā', 'á', 'ǎ', 'à'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
  v: ['ǖ', 'ǘ', 'ǚ', 'ǜ'], // Alternative notation for ü
};

/**
 * Find the position of the vowel that should receive the tone mark
 * Based on standard pinyin tone placement rules:
 * 1. "a" or "e" always gets the tone mark
 * 2. Otherwise "o" gets it
 * 3. For "iu", the "u" gets the mark
 * 4. For "ui", the "i" gets the mark
 * 5. Otherwise, the last vowel gets the mark
 */
function findTonePosition(syllable: string): number {
  const lower = syllable.toLowerCase();

  // Rule 1: "a" or "e" has highest priority
  if (lower.includes('a')) return lower.indexOf('a');
  if (lower.includes('e')) return lower.indexOf('e');

  // Rule 2: "o" comes next
  if (lower.includes('o')) return lower.indexOf('o');

  // Rule 3: Special case for "iu" - mark the "u"
  const iuIndex = lower.indexOf('iu');
  if (iuIndex !== -1) return iuIndex + 1; // Position of "u"

  // Rule 4: Special case for "ui" - mark the "i"
  const uiIndex = lower.indexOf('ui');
  if (uiIndex !== -1) return uiIndex + 1; // Position of "i"

  // Rule 5: Mark the last vowel (i, u, ü, v)
  const vowels = 'iuüv';
  for (let i = lower.length - 1; i >= 0; i--) {
    if (vowels.includes(lower[i])) return i;
  }

  return -1; // No vowel found (shouldn't happen in valid pinyin)
}

/**
 * Apply tone mark to a vowel
 */
function applyToneMark(vowel: string, tone: number): string {
  const lowerVowel = vowel.toLowerCase();

  if (!TONE_MARKS[lowerVowel]) {
    return vowel; // Not a vowel that can have tone marks
  }

  if (tone < 1 || tone > 4) {
    return vowel; // Neutral tone (5) or invalid
  }

  const markedVowel = TONE_MARKS[lowerVowel][tone - 1];

  // Preserve original case if uppercase
  return vowel === vowel.toUpperCase()
    ? markedVowel.toUpperCase()
    : markedVowel;
}

/**
 * Convert a single numbered pinyin syllable to tone-marked pinyin
 * @param syllable - e.g., "zhong1", "guo2", "ni3", "hao3", "nu:3", "lu:4"
 * @returns Tone-marked syllable - e.g., "zhōng", "guó", "nǐ", "hǎo", "nǚ", "lǜ"
 */
function convertSyllable(syllable: string): string {
  // First handle colon notation (u:4, nu:3) - CEDICT uses this for ü
  let processedSyllable = syllable;
  processedSyllable = processedSyllable.replace(/u:/g, 'ü'); // u: → ü
  processedSyllable = processedSyllable.replace(/v:/g, 'ü'); // v: → ü (alternative)

  // Match letter part and tone number
  const match = processedSyllable.match(/^([a-züvA-ZÜVÜ]+)(\d)?$/);

  if (!match) {
    return syllable; // Return as-is if format doesn't match
  }

  const [, letters, toneStr] = match;
  const tone = toneStr ? parseInt(toneStr, 10) : 5; // 5 = neutral tone

  // Neutral tone or no tone number - return unchanged
  if (tone === 5 || !toneStr) {
    return letters;
  }

  // Invalid tone
  if (tone < 1 || tone > 4) {
    return letters;
  }

  // Find which vowel should receive the tone mark
  const tonePos = findTonePosition(letters);

  if (tonePos === -1) {
    return letters; // No vowel found
  }

  // Apply tone mark
  const chars = letters.split('');
  chars[tonePos] = applyToneMark(chars[tonePos], tone);

  return chars.join('');
}

/**
 * Check if a string contains numbered pinyin format
 * @param text - Text to check
 * @returns true if contains pinyin tone numbers (excluding false positives like "4S")
 */
export function hasNumberedPinyin(text: string): boolean {
  if (!text) return false;

  // Check for colon notation (u:4, nu:3)
  if (/[uv]:\d/.test(text)) return true;

  // Check for standard tone numbers, but exclude patterns like "4S", "3G"
  // A valid numbered pinyin has letters followed by a digit
  return /[a-züvA-ZÜVÜ]\d/.test(text);
}

/**
 * Convert numbered pinyin to tone-marked pinyin
 * @param numberedPinyin - e.g., "zhong1 guo2", "ni3 hao3 ma5", "nu:3", "lu:4"
 * @returns Tone-marked pinyin - e.g., "zhōng guó", "nǐ hǎo ma", "nǚ", "lǜ"
 */
export function convertPinyinTones(numberedPinyin: string): string {
  if (!numberedPinyin || numberedPinyin.trim() === '') {
    return numberedPinyin;
  }

  // Split by spaces and convert each syllable
  const syllables = numberedPinyin.trim().split(/\s+/);
  const converted = syllables.map(convertSyllable);

  return converted.join(' ');
}

/**
 * Normalize pinyin by removing tone marks (accent-insensitive search)
 * @param pinyin - Toned pinyin e.g., "nǐ hǎo", "zhōng guó"
 * @returns Normalized pinyin e.g., "ni hao", "zhong guo"
 */
export function normalizePinyin(pinyin: string): string {
  if (!pinyin) return '';

  const toneMap: Record<string, string> = {
    // a tones
    ā: 'a',
    á: 'a',
    ǎ: 'a',
    à: 'a',
    Ā: 'A',
    Á: 'A',
    Ǎ: 'A',
    À: 'A',
    // e tones
    ē: 'e',
    é: 'e',
    ě: 'e',
    è: 'e',
    Ē: 'E',
    É: 'E',
    Ě: 'E',
    È: 'E',
    // i tones
    ī: 'i',
    í: 'i',
    ǐ: 'i',
    ì: 'i',
    Ī: 'I',
    Í: 'I',
    Ǐ: 'I',
    Ì: 'I',
    // o tones
    ō: 'o',
    ó: 'o',
    ǒ: 'o',
    ò: 'o',
    Ō: 'O',
    Ó: 'O',
    Ǒ: 'O',
    Ò: 'O',
    // u tones
    ū: 'u',
    ú: 'u',
    ǔ: 'u',
    ù: 'u',
    Ū: 'U',
    Ú: 'U',
    Ǔ: 'U',
    Ù: 'U',
    // ü tones
    ǖ: 'u',
    ǘ: 'u',
    ǚ: 'u',
    ǜ: 'u',
    ü: 'u',
    Ǖ: 'U',
    Ǘ: 'U',
    Ǚ: 'U',
    Ǜ: 'U',
    Ü: 'U',
  };

  let normalized = pinyin;
  for (const [toned, plain] of Object.entries(toneMap)) {
    normalized = normalized.replace(new RegExp(toned, 'g'), plain);
  }

  return normalized.toLowerCase();
}

/**
 * Test function - run with: ts-node database/utils/pinyin-converter.ts
 */
function runTests() {
  const tests = [
    { input: 'zhong1 guo2', expected: 'zhōng guó' },
    { input: 'ni3 hao3', expected: 'nǐ hǎo' },
    { input: 'xue2 xi2', expected: 'xué xí' },
    { input: 'dian3 jin1 shi2', expected: 'diǎn jīn shí' },
    { input: 'liu2', expected: 'liú' },
    { input: 'hui4', expected: 'huì' },
    { input: 'ma5', expected: 'ma' },
    { input: 'zhong1', expected: 'zhōng' },
    { input: 'lv3', expected: 'lǚ' },
    { input: 'nü3', expected: 'nǚ' },
    { input: 'Beijing', expected: 'Beijing' }, // No numbers
    { input: 'chang2', expected: 'cháng' },
    { input: 'dou1', expected: 'dōu' },
  ];

  console.log('\n🧪 Testing Pinyin Tone Converter\n');

  let passed = 0;
  let failed = 0;

  tests.forEach(({ input, expected }) => {
    const result = convertPinyinTones(input);
    const status = result === expected ? '✓' : '✗';

    if (result === expected) {
      passed++;
      console.log(`${status} "${input}" → "${result}"`);
    } else {
      failed++;
      console.log(
        `${status} "${input}" → "${result}" (expected: "${expected}")`,
      );
    }
  });

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests();
}
