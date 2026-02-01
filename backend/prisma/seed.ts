import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Radicals (Sample of Kangxi 214)
  const radicalsData = [
    { char: '一', variant: 'common', strokeCount: 1, meaning: { vi: 'một', en: 'one', zh: '一部' }, frequency: 1000 },
    { char: '丨', variant: 'common', strokeCount: 1, meaning: { vi: 'nét sổ', en: 'line', zh: '丨部' }, frequency: 100 },
    { char: '丶', variant: 'common', strokeCount: 1, meaning: { vi: 'chấm', en: 'dot', zh: '丶部' }, frequency: 200 },
    { char: '丿', variant: 'common', strokeCount: 1, meaning: { vi: 'phẩy', en: 'slash', zh: '丿部' }, frequency: 300 },
    { char: '乙', variant: 'common', strokeCount: 1, meaning: { vi: 'cong', en: 'second', zh: '乙部' }, frequency: 400 },
    { char: '亅', variant: 'common', strokeCount: 1, meaning: { vi: 'móc', en: 'hook', zh: '亅部' }, frequency: 150 },
    { char: '二', variant: 'common', strokeCount: 2, meaning: { vi: 'hai', en: 'two', zh: '二部' }, frequency: 800 },
    { char: '亠', variant: 'common', strokeCount: 2, meaning: { vi: 'đầu', en: 'lid', zh: '亠部' }, frequency: 600 },
    { char: '人', variant: 'common', strokeCount: 2, meaning: { vi: 'người', en: 'man', zh: '人部' }, frequency: 5000 },
    { char: '儿', variant: 'common', strokeCount: 2, meaning: { vi: 'con', en: 'legs', zh: '儿部' }, frequency: 450 },
    { char: '入', variant: 'common', strokeCount: 2, meaning: { vi: 'vào', en: 'enter', zh: '入部' }, frequency: 400 },
    { char: '八', variant: 'common', strokeCount: 2, meaning: { vi: 'tám', en: 'eight', zh: '八部' }, frequency: 700 },
    { char: '氵', variant: 'common', strokeCount: 3, meaning: { vi: 'nước', en: 'water', zh: '水' }, frequency: 9000 },
    { char: '口', variant: 'common', strokeCount: 3, meaning: { vi: 'miệng', en: 'mouth', zh: '口' }, frequency: 8500 },
    { char: '木', variant: 'common', strokeCount: 4, meaning: { vi: 'cây', en: 'wood', zh: '木' }, frequency: 8000 },
    { char: '宀', variant: 'common', strokeCount: 3, meaning: { vi: 'mái nhà', en: 'roof', zh: '宀' }, frequency: 7500 },
  ];

  for (const r of radicalsData) {
    await prisma.radical.upsert({
      where: { char: r.char },
      update: {},
      create: r,
    });
  }

  console.log(`Seeded ${radicalsData.length} radicals.`);

  // Sample Words
  const wordsData = [
    {
      languageCode: 'zh-TW',
      word: '學',
      level: 'A1',
      metadata: { pinyin: 'xué' },
      radicals: ['宀', '子'], // Simplified relation logic for seed
    },
    {
      languageCode: 'zh-TW',
      word: '校',
      level: 'A1',
      metadata: { pinyin: 'xiào' },
      radicals: ['木', '亠', '父'], 
    },
  ];

  // Note: This seed script assumes radicals exist.
  // We need to fetch radical IDs to link.
  
  // Actually, to proper link, I will just create words without decomposition in seed for simplicity 
  // unless I query the IDs.
  
  // Fetch radicals map
  const radicalsMap: Record<string, string> = {};
  const allRadicals = await prisma.radical.findMany();
  allRadicals.forEach(r => radicalsMap[r.char] = r.id);

  for (const w of wordsData) {
    const { radicals, ...wordData } = w;
    const word = await prisma.word.upsert({
      where: { word: wordData.word },
      update: {},
      create: {
        ...wordData,
        metadata: wordData.metadata || {},
      },
    });

    if (radicals) {
        // Link radicals
        for (let i = 0; i < radicals.length; i++) {
            const char = radicals[i];
            const radicalId = radicalsMap[char];
            if (radicalId) {
                // Check if exists
                const existing = await prisma.wordRadical.findFirst({
                    where: { wordId: word.id, radicalId }
                });
                if(!existing) {
                    await prisma.wordRadical.create({
                        data: {
                            wordId: word.id,
                            radicalId,
                            position: i
                        }
                    })
                }
            }
        }
    }
  }

  console.log(`Seeded ${wordsData.length} words.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
