import { PrismaClient } from '@prisma/client';
import { importViExtract } from '../database/import-vi-extract';
import * as path from 'path';

const prisma = new PrismaClient();

async function importRadicals() {
  console.log('\n📚 Importing Kangxi radicals...');

  // Check if radicals already imported
  const count = await prisma.radical.count();
  if (count >= 214) {
    console.log('✓ Radicals already imported (214 total)\n');
    return;
  }

  // Run import-radicals script
  try {
    const { execSync } = require('child_process');
    execSync('npm run import-radicals', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
  } catch (error) {
    console.error('Error importing radicals:', error);
  }
}

async function importViExtractDictionary() {
  console.log('\n📘 Importing vi-extract dictionary (all languages)...');

  const sourceCount = await prisma.$queryRaw<Array<{ count: number }>>`
    SELECT COUNT(*)::int AS count
    FROM "Word"
    WHERE "metadata"->>'source' = 'vi-extract'
  `;

  const count = sourceCount[0]?.count ?? 0;
  if (count > 1000) {
    console.log(
      `✓ vi-extract already imported (${count.toLocaleString()} words)\n`,
    );
    return;
  }

  try {
    await importViExtract(0);
  } catch (error) {
    console.error('Error importing vi-extract dictionary:', error);
  }
}

async function main() {
  console.log('\n🌱 Starting database seed...\n');

  // Import radicals (214 Kangxi radicals)
  await importRadicals();

  // Import dictionary entries from vi-extract.jsonl (all languages)
  await importViExtractDictionary();

  console.log('\n✅ Database seeding completed!\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
