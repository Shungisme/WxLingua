import { PrismaClient } from '@prisma/client';
import { importCedict } from '../database/import-cedict';
import * as path from 'path';
import * as fs from 'fs';

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

async function importDictionary() {
  console.log('\n📖 Importing CC-CEDICT dictionary...');

  // Check if dictionary already imported
  const count = await prisma.word.count({ where: { languageCode: 'zh-TW' } });
  if (count > 100) {
    console.log(
      `✓ Dictionary already imported (${count.toLocaleString()} words)\n`,
    );
    return;
  }

  // Import with reasonable limit (or all if you want)
  try {
    await importCedict();
  } catch (error) {
    console.error('Error importing dictionary:', error);
  }
}

async function main() {
  console.log('\n🌱 Starting database seed...\n');

  // Import radicals (214 Kangxi radicals)
  await importRadicals();

  // Import CEDICT dictionary (will also update pinyin tones)
  await importDictionary();

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
