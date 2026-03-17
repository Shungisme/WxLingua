#!/usr/bin/env ts-node
/**
 * Import dictionary entries from vi-extract.jsonl (all languages)
 *
 * Usage:
 *   npm run import-vi-extract
 *   npm run import-vi-extract -- --limit 20000
 *   npm run import-vi-extract -- --all
 */

import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

type ViSense = {
  glosses?: string[];
};

type ViTranslation = {
  lang_code?: string;
  word?: string;
};

type ViSound = {
  ipa?: string;
  tags?: string[];
};

type ViExtractEntry = {
  word?: string;
  lang_code?: string;
  lang?: string;
  pos?: string;
  pos_title?: string;
  senses?: ViSense[];
  categories?: string[];
  translations?: ViTranslation[];
  sounds?: ViSound[];
};

const prisma = new PrismaClient();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) =>
    console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg: string) =>
    console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
};

function getDefaultViExtractPath(): string {
  return path.join(__dirname, 'dictionaries', 'vi-extract.jsonl');
}

function parseArgs(): { limit: number } {
  const args = process.argv.slice(2);
  let limit = 20000;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--all') {
      limit = 0;
    }
  }

  return { limit };
}

function splitConcatenatedJsonObjects(line: string): string[] {
  const objects: string[] = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let start = -1;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === '{') {
      if (depth === 0) {
        start = i;
      }
      depth++;
      continue;
    }

    if (ch === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        objects.push(line.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return objects;
}

function toWordRow(entry: ViExtractEntry): Prisma.WordCreateManyInput | null {
  if (!entry.word || !entry.word.trim()) {
    return null;
  }

  const languageCode = (entry.lang_code || '').trim().toLowerCase();
  if (!languageCode) {
    return null;
  }

  const glosses = (entry.senses || [])
    .flatMap((sense) => sense.glosses || [])
    .filter((g) => Boolean(g && g.trim()))
    .slice(0, 8);

  const senses = (entry.senses || [])
    .map((sense) => ({
      glosses: (sense.glosses || []).filter((g) => Boolean(g && g.trim())),
    }))
    .filter((sense) => sense.glosses.length > 0)
    .slice(0, 8);

  const translations = (entry.translations || [])
    .filter((t) => t.word && t.word.trim())
    .map((t) => ({
      lang_code: t.lang_code || null,
      word: t.word?.trim() || null,
    }))
    .slice(0, 15);

  const sounds = (entry.sounds || [])
    .filter((s) => Boolean(s.ipa && s.ipa.trim()))
    .map((s) => ({
      ipa: s.ipa?.trim() || null,
      tags: Array.isArray(s.tags) ? s.tags.slice(0, 5) : [],
    }))
    .slice(0, 10);

  const firstIpa = (entry.sounds || []).find((s) => s.ipa && s.ipa.trim())?.ipa;

  return {
    languageCode,
    word: entry.word.trim(),
    metadata: {
      source: 'vi-extract',
      lang_code: languageCode,
      lang: entry.lang || null,
      pos: entry.pos || null,
      pos_title: entry.pos_title || null,
      senses,
      glosses,
      translations,
      sounds,
      ipa: firstIpa || null,
      categories: (entry.categories || []).slice(0, 20),
    },
  };
}

async function importViExtract(limitOverride?: number): Promise<void> {
  const startTime = Date.now();
  const limit = limitOverride !== undefined ? limitOverride : parseArgs().limit;
  const inputPath = getDefaultViExtractPath();

  console.log('');
  console.log('='.repeat(50));
  console.log('Dictionary Import (vi-extract, all languages)');
  console.log('='.repeat(50));
  console.log('');

  if (!fs.existsSync(inputPath)) {
    log.warning(`Dictionary file not found: ${inputPath}`);
    return;
  }

  if (limit > 0) {
    log.info(`Limit: ${limit.toLocaleString()} entries`);
  } else {
    log.info('Limit: ALL entries');
  }

  const rows: Prisma.WordCreateManyInput[] = [];
  let parsedObjects = 0;
  let invalidObjects = 0;

  const rl = readline.createInterface({
    input: fs.createReadStream(inputPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  for await (const rawLine of rl) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const objects = splitConcatenatedJsonObjects(line);
    if (objects.length === 0) {
      invalidObjects++;
      continue;
    }

    for (const objText of objects) {
      try {
        const entry = JSON.parse(objText) as ViExtractEntry;
        parsedObjects++;

        const row = toWordRow(entry);
        if (!row) {
          continue;
        }

        rows.push(row);

        if (limit > 0 && rows.length >= limit) {
          break;
        }
      } catch {
        invalidObjects++;
      }
    }

    if (limit > 0 && rows.length >= limit) {
      break;
    }
  }

  if (rows.length === 0) {
    log.warning('No valid entries found to import.');
    return;
  }

  const batchSize = 500;
  let inserted = 0;
  let processed = 0;

  log.info(`Prepared ${rows.length.toLocaleString()} rows for insertion`);

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const result = await prisma.word.createMany({
      data: batch,
      skipDuplicates: true,
    });

    inserted += result.count;
    processed += batch.length;

    const percentage = ((processed / rows.length) * 100).toFixed(1);
    process.stdout.write(
      `\r${colors.cyan}⟳${colors.reset} Importing: ${processed}/${rows.length} (${percentage}%)`,
    );
  }

  process.stdout.write('\n');

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const skipped = rows.length - inserted;

  console.log('');
  log.success(`Imported ${inserted.toLocaleString()} new words`);
  log.info(`Skipped ${skipped.toLocaleString()} duplicates`);
  log.info(`Parsed objects: ${parsedObjects.toLocaleString()}`);
  if (invalidObjects > 0) {
    log.warning(`Invalid objects skipped: ${invalidObjects.toLocaleString()}`);
  }
  log.success(`Import completed in ${duration}s`);
  console.log('');
}

if (require.main === module) {
  importViExtract()
    .catch((error) => {
      log.error('Import failed');
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { importViExtract };
