#!/usr/bin/env ts-node
/**
 * Update Pinyin Tones Migration Script
 *
 * Converts numbered pinyin (e.g., "xue2 xi2") in existing database records
 * to tone-marked pinyin (e.g., "xué xí")
 *
 * Usage:
 *   npm run update-pinyin
 */

import { PrismaClient } from '@prisma/client';
import { convertPinyinTones } from './utils/pinyin-converter';

const prisma = new PrismaClient();

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

async function updatePinyinTones() {
  console.log(
    `\n${colors.cyan}⟳ Updating pinyin tones in database...${colors.reset}\n`,
  );

  try {
    // Get all Chinese words with numbered pinyin
    const words = await prisma.word.findMany({
      where: {
        languageCode: {
          in: ['zh-TW', 'zh-CN'], // Both Traditional and Simplified Chinese
        },
      },
    });

    console.log(
      `${colors.blue}ℹ${colors.reset} Found ${words.length} Chinese words\n`,
    );

    if (words.length === 0) {
      console.log(`${colors.yellow}⚠${colors.reset} No words to update\n`);
      return;
    }

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Process each word
    for (const word of words) {
      try {
        const metadata = word.metadata as any;

        // Check if metadata has pinyin field
        if (!metadata || !metadata.pinyin) {
          skipped++;
          continue;
        }

        const oldPinyin = metadata.pinyin;

        // Check if pinyin already has tone marks (doesn't contain numbers)
        if (!/\d/.test(oldPinyin)) {
          // Already converted
          skipped++;
          continue;
        }

        // Convert pinyin
        const newPinyin = convertPinyinTones(oldPinyin);

        // Update the word
        await prisma.word.update({
          where: { id: word.id },
          data: {
            metadata: {
              ...metadata,
              pinyin: newPinyin,
            },
          },
        });

        updated++;

        // Show progress every 100 words
        if (updated % 100 === 0) {
          process.stdout.write(
            `\r${colors.cyan}⟳${colors.reset} Progress: ${updated}/${words.length} updated`,
          );
        }
      } catch (error) {
        errors++;
        console.error(
          `\n${colors.yellow}⚠${colors.reset} Error updating word ${word.id}:`,
          error,
        );
      }
    }

    // Clear progress line
    if (updated > 0) {
      process.stdout.write('\r' + ' '.repeat(50) + '\r');
    }

    // Summary
    console.log(`${colors.green}✓${colors.reset} Updated ${updated} words`);
    console.log(
      `${colors.blue}ℹ${colors.reset} Skipped ${skipped} words (already converted or no pinyin)`,
    );

    if (errors > 0) {
      console.log(`${colors.yellow}⚠${colors.reset} Errors: ${errors}\n`);
    } else {
      console.log();
    }

    // Show some examples
    if (updated > 0) {
      console.log(`${colors.cyan}📝 Sample conversions:${colors.reset}\n`);

      const samples = await prisma.word.findMany({
        where: {
          languageCode: 'zh-TW',
        },
        take: 5,
      });

      samples.forEach((word) => {
        const metadata = word.metadata as any;
        console.log(
          `  ${word.word} (${metadata.simplified}) - ${colors.green}${metadata.pinyin}${colors.reset}`,
        );
      });

      console.log();
    }
  } catch (error) {
    console.error(
      `\n${colors.yellow}✗${colors.reset} Migration failed:`,
      error,
    );
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
updatePinyinTones()
  .then(() => {
    console.log(
      `${colors.green}✓ Migration completed successfully${colors.reset}\n`,
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error(
      `\n${colors.yellow}✗ Migration failed:${colors.reset}`,
      error,
    );
    process.exit(1);
  });
