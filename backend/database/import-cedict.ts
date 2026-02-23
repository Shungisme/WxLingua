#!/usr/bin/env ts-node
/**
 * Import CC-CEDICT Dictionary
 *
 * Imports Chinese words from the CC-CEDICT dictionary into the database
 *
 * Usage:
 *   npm run import-cedict
 *   npm run import-cedict -- --limit 5000
 *   npm run import-cedict -- --all
 */

import { PrismaClient } from '@prisma/client';
import {
  parseCedictFile,
  getDefaultCedictPath,
  WordData,
} from './parsers/cedict-parser';

// ANSI color codes
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

/**
 * Parse command line arguments
 */
function parseArgs(): { limit: number } {
  const args = process.argv.slice(2);
  let limit = 3000; // Default limit

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--all') {
      limit = 0; // No limit
    }
  }

  return { limit };
}

/**
 * Insert words in batches
 */
async function insertWordsBatch(
  prisma: PrismaClient,
  words: WordData[],
  batchSize: number = 500,
): Promise<number> {
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);

    try {
      // Use createMany with skipDuplicates
      const result = await prisma.word.createMany({
        data: batch.map((w) => ({
          id: w.id,
          languageCode: w.languageCode,
          word: w.word,
          metadata: w.metadata,
        })),
        skipDuplicates: true,
      });

      inserted += result.count;

      // Progress indicator
      const progress = Math.min(i + batchSize, words.length);
      const percentage = ((progress / words.length) * 100).toFixed(1);
      process.stdout.write(
        `\r${colors.cyan}⟳${colors.reset} Importing: ${progress}/${words.length} (${percentage}%)`,
      );
    } catch (error) {
      log.error(`Failed to insert batch ${i / batchSize + 1}`);
      throw error;
    }
  }

  process.stdout.write('\n');
  skipped = words.length - inserted;

  return inserted;
}

/**
 * Main import function
 */
async function importCedict(): Promise<void> {
  const startTime = Date.now();
  const { limit } = parseArgs();

  console.log('');
  console.log('='.repeat(50));
  console.log('CC-CEDICT Dictionary Import');
  console.log('='.repeat(50));
  console.log('');

  if (limit > 0) {
    log.info(`Limit: ${limit.toLocaleString()} words`);
  } else {
    log.info('Limit: ALL words');
  }
  console.log('');

  const prisma = new PrismaClient();

  try {
    // Parse cedict file
    log.info('Parsing CC-CEDICT dictionary...');
    const cedictPath = getDefaultCedictPath();
    const words = parseCedictFile(cedictPath, limit);
    log.success(`Parsed ${words.length.toLocaleString()} entries`);
    console.log('');

    // Check existing words
    log.info('Checking existing words...');
    const existingCount = await prisma.word.count({
      where: { languageCode: 'zh-TW' },
    });
    log.info(`Found ${existingCount.toLocaleString()} existing Chinese words`);
    console.log('');

    // Import words
    log.info('Importing words to database...');
    const inserted = await insertWordsBatch(prisma, words);

    console.log('');
    log.success(`Imported ${inserted.toLocaleString()} new words`);

    if (inserted < words.length) {
      log.info(
        `Skipped ${(words.length - inserted).toLocaleString()} duplicates`,
      );
    }

    // Final stats
    const totalCount = await prisma.word.count({
      where: { languageCode: 'zh-TW' },
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('');
    console.log('='.repeat(50));
    log.success(`Import completed in ${duration}s`);
    console.log('='.repeat(50));
    console.log('');
    log.info(`Total Chinese words in database: ${totalCount.toLocaleString()}`);
    console.log('');
  } catch (error) {
    console.log('');
    console.log('='.repeat(50));
    log.error('Import failed');
    console.log('='.repeat(50));
    console.log('');

    if (error instanceof Error) {
      log.error(error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run import
if (require.main === module) {
  importCedict().catch((error) => {
    log.error('Unhandled error:');
    console.error(error);
    process.exit(1);
  });
}

export { importCedict };
