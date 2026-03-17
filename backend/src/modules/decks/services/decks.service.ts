import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';
import { CreateDeckDto } from '../../../core/dtos/decks/create-deck.dto';
import { CreateDeckCardDto } from '../../../core/dtos/decks/create-deck-card.dto';
import { UpdateDeckCardDto } from '../../../core/dtos/decks/update-deck-card.dto';
import * as XLSX from 'xlsx';

export interface FindDecksQuery {
  public?: string;
}

@Injectable()
export class DecksService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateDeckDto) {
    return this.prisma.deck.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(userId: string | undefined, query: FindDecksQuery) {
    if (query.public === 'true') {
      return this.prisma.deck.findMany({
        where: { isPublic: true },
        include: { user: { select: { name: true, avatar: true } } },
      });
    }

    if (!userId) return [];

    const now = new Date();
    const decks = await this.prisma.deck.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            deckCards: { where: { nextReview: { lte: now } } },
          },
        },
      },
    });

    return decks.map(({ _count, ...deck }) => ({
      ...deck,
      dueCount: _count.deckCards,
    }));
  }

  async findOne(id: string) {
    const deck = await this.prisma.deck.findUnique({
      where: { id },
      include: {
        deckCards: {
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!deck) throw new NotFoundException('Deck not found');
    return deck;
  }

  // ---------------------------------------------------------------------------
  // Add words from the dictionary (creates DeckCards copying word content)
  // ---------------------------------------------------------------------------
  async addWords(userId: string, deckId: string, wordIds: string[]) {
    const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) throw new NotFoundException('Deck not found');
    if (deck.userId !== userId) throw new ForbiddenException('Not your deck');

    const words = await this.prisma.word.findMany({
      where: { id: { in: wordIds } },
    });

    const currentCount = await this.prisma.deckCard.count({
      where: { deckId },
    });

    await Promise.all(
      words.map((word, index) => {
        const meta = (word.metadata ?? {}) as Record<string, unknown>;
        const meaning = this.extractMeaning(meta);
        const pronunciation =
          typeof meta['pinyin'] === 'string'
            ? meta['pinyin']
            : typeof meta['phonetic'] === 'string'
              ? meta['phonetic']
              : undefined;

        return this.prisma.deckCard
          .create({
            data: {
              deckId,
              sourceWordId: word.id,
              term: word.word,
              meaning: meaning ?? undefined,
              pronunciation: pronunciation ?? undefined,
              imageUrl: undefined,
              audioUrl: word.audioUrl ?? undefined,
              position: currentCount + index,
            },
          })
          .catch(() => null); // ignore duplicate term in deck
      }),
    );

    const count = await this.prisma.deckCard.count({ where: { deckId } });
    return this.prisma.deck.update({
      where: { id: deckId },
      data: { cardCount: count },
    });
  }

  // ---------------------------------------------------------------------------
  // Remove a single DeckCard
  // ---------------------------------------------------------------------------
  async removeCard(userId: string, deckId: string, cardId: string) {
    const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) throw new NotFoundException('Deck not found');
    if (deck.userId !== userId) throw new ForbiddenException('Not your deck');

    await this.prisma.deckCard.deleteMany({ where: { id: cardId, deckId } });

    const count = await this.prisma.deckCard.count({ where: { deckId } });
    return this.prisma.deck.update({
      where: { id: deckId },
      data: { cardCount: count },
    });
  }

  // ---------------------------------------------------------------------------
  // Update DeckCard content (term, meaning, pronunciation, imageUrl, notes)
  // ---------------------------------------------------------------------------
  async updateCard(
    userId: string,
    deckId: string,
    cardId: string,
    dto: UpdateDeckCardDto,
  ) {
    const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) throw new NotFoundException('Deck not found');
    if (deck.userId !== userId) throw new ForbiddenException('Not your deck');

    const card = await this.prisma.deckCard.findFirst({
      where: { id: cardId, deckId },
    });
    if (!card) throw new NotFoundException('Card not found');

    return this.prisma.deckCard.update({
      where: { id: cardId },
      data: {
        ...(dto.term !== undefined && { term: dto.term }),
        ...(dto.meaning !== undefined && { meaning: dto.meaning }),
        ...(dto.pronunciation !== undefined && {
          pronunciation: dto.pronunciation,
        }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.audioUrl !== undefined && { audioUrl: dto.audioUrl }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async createCard(userId: string, deckId: string, dto: CreateDeckCardDto) {
    const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) throw new NotFoundException('Deck not found');
    if (deck.userId !== userId) throw new ForbiddenException('Not your deck');

    const term = dto.term.trim();
    if (!term) {
      throw new BadRequestException('Term is required');
    }

    const normalizedMeaning = this.normalizeMeaning(dto.meaning);

    const maxPos = await this.prisma.deckCard.aggregate({
      where: { deckId },
      _max: { position: true },
    });

    try {
      const card = await this.prisma.deckCard.create({
        data: {
          deckId,
          term,
          pronunciation: dto.pronunciation?.trim() || undefined,
          meaning: normalizedMeaning,
          notes: dto.notes?.trim() || undefined,
          imageUrl: dto.imageUrl?.trim() || undefined,
          audioUrl: dto.audioUrl?.trim() || undefined,
          position: (maxPos._max.position ?? -1) + 1,
        },
      });

      await this.prisma.deck.update({
        where: { id: deckId },
        data: { cardCount: { increment: 1 } },
      });

      return card;
    } catch {
      throw new BadRequestException('This term is already in the deck');
    }
  }

  // ---------------------------------------------------------------------------
  // Bulk import by text (one term per line) – creates DeckCards from dictionary
  // ---------------------------------------------------------------------------
  async bulkImportByText(userId: string, deckId: string, texts: string[]) {
    const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) throw new NotFoundException('Deck not found');
    if (deck.userId !== userId) throw new ForbiddenException('Not your deck');

    const unique = [...new Set(texts.map((t) => t.trim()).filter(Boolean))];

    const words = await this.prisma.word.findMany({
      where: { word: { in: unique } },
      select: { id: true, word: true },
    });

    const found = words.map((w) => w.word);
    const notFound = unique.filter((t) => !found.includes(t));

    if (words.length > 0) {
      await this.addWords(
        userId,
        deckId,
        words.map((w) => w.id),
      );
    }

    return { added: words.length, notFound };
  }

  // ---------------------------------------------------------------------------
  // Bulk import from CSV / Excel file – creates DeckCards directly
  // ---------------------------------------------------------------------------
  async bulkImportFromFile(
    userId: string,
    deckId: string,
    buffer: Buffer,
    originalname: string,
  ): Promise<{ added: number; skipped: number; total: number }> {
    const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) throw new NotFoundException('Deck not found');
    if (deck.userId !== userId) throw new ForbiddenException('Not your deck');

    const ext = originalname.split('.').pop()?.toLowerCase();
    if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
      throw new BadRequestException(
        'Only .csv, .xlsx and .xls files are supported',
      );
    }

    let rows: Record<string, unknown>[];
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: '',
      });
    } catch {
      throw new BadRequestException(
        'Failed to parse file – make sure it follows the sample template',
      );
    }

    if (rows.length === 0) return { added: 0, skipped: 0, total: 0 };

    // Get the current highest position in this deck
    const maxPos = await this.prisma.deckCard.aggregate({
      where: { deckId },
      _max: { position: true },
    });
    let position = (maxPos._max.position ?? -1) + 1;

    // Get existing terms to detect duplicates
    const existing = await this.prisma.deckCard.findMany({
      where: { deckId },
      select: { term: true },
    });
    const existingTerms = new Set(existing.map((c) => c.term));

    const toCreate: {
      deckId: string;
      term: string;
      pronunciation?: string;
      meaning?: Record<string, string>;
      notes?: string;
      imageUrl?: string;
      audioUrl?: string;
      position: number;
    }[] = [];

    for (const row of rows) {
      const normalizedRow = this.normalizeRowKeys(row);
      const term =
        this.getCellString(
          this.pickRowValue(normalizedRow, [
            'term',
            'word',
            'hanzi',
            'character',
            'text',
          ]),
        ) || undefined;

      if (!term) {
        continue;
      }

      if (existingTerms.has(term)) {
        continue;
      }
      existingTerms.add(term); // prevent duplicate within same file

      const meaning: Record<string, string> = {};
      const vi = this.getCellString(
        this.pickRowValue(normalizedRow, ['meaning_vi', 'vi', 'meaning_vn']),
      );
      const en = this.getCellString(
        this.pickRowValue(normalizedRow, ['meaning_en', 'en']),
      );
      const genericMeaning = this.getCellString(
        this.pickRowValue(normalizedRow, ['meaning', 'definition', 'gloss']),
      );
      if (vi) meaning['vi'] = vi;
      if (en) meaning['en'] = en;
      if (!vi && !en && genericMeaning) {
        meaning['vi'] = genericMeaning;
      }

      const pronunciation = this.getCellString(
        this.pickRowValue(normalizedRow, [
          'pronunciation',
          'pinyin',
          'phonetic',
        ]),
      );
      const notes = this.getCellString(
        this.pickRowValue(normalizedRow, ['notes', 'note']),
      );
      const imageUrl = this.getCellString(
        this.pickRowValue(normalizedRow, ['imageurl', 'image_url', 'image']),
      );
      const audioUrl = this.getCellString(
        this.pickRowValue(normalizedRow, ['audiourl', 'audio_url', 'audio']),
      );

      toCreate.push({
        deckId,
        term,
        pronunciation: pronunciation || undefined,
        meaning: Object.keys(meaning).length > 0 ? meaning : undefined,
        notes: notes || undefined,
        imageUrl: imageUrl || undefined,
        audioUrl: audioUrl || undefined,
        position: position++,
      });
    }

    let added = 0;
    if (toCreate.length > 0) {
      const result = await this.prisma.deckCard.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
      added = result.count;

      if (added > 0) {
        await this.prisma.deck.update({
          where: { id: deckId },
          data: { cardCount: { increment: added } },
        });
      }
    }

    return {
      added,
      skipped: rows.length - added,
      total: rows.length,
    };
  }

  async exportDeckAsCsv(userId: string, deckId: string): Promise<string> {
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        deckCards: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    if (deck.userId !== userId) {
      throw new ForbiddenException('Not your deck');
    }

    const header = [
      'term',
      'pronunciation',
      'meaning_vi',
      'meaning_en',
      'notes',
      'imageUrl',
      'audioUrl',
    ];

    const rows = deck.deckCards.map((card) => {
      const meaning = (card.meaning ?? {}) as Record<string, unknown>;
      return [
        card.term,
        card.pronunciation ?? '',
        typeof meaning['vi'] === 'string' ? meaning['vi'] : '',
        typeof meaning['en'] === 'string' ? meaning['en'] : '',
        card.notes ?? '',
        card.imageUrl ?? '',
        card.audioUrl ?? '',
      ];
    });

    const csvBody = [header, ...rows]
      .map((line) => line.map((cell) => this.escapeCsv(cell)).join(','))
      .join('\n');

    // Prefix BOM so Excel opens Vietnamese/Chinese text correctly.
    return `\uFEFF${csvBody}`;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  private extractMeaning(
    meta: Record<string, unknown>,
  ): Record<string, string> | null {
    const candidates: Record<string, string> = {};
    for (const [k, v] of Object.entries(meta)) {
      if (
        typeof v === 'string' &&
        !['pinyin', 'phonetic', 'reading', 'romaji'].includes(k)
      ) {
        candidates[k] = v;
      }
    }
    return Object.keys(candidates).length > 0 ? candidates : null;
  }

  private getCellString(value: unknown): string {
    if (typeof value === 'string') {
      return this.normalizeText(value);
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return this.normalizeText(String(value));
    }

    return '';
  }

  private normalizeMeaning(
    meaning: Record<string, string> | undefined,
  ): Record<string, string> | undefined {
    if (!meaning) {
      return undefined;
    }

    const entries = Object.entries(meaning)
      .map(([k, v]) => [k.trim(), (v ?? '').trim()] as const)
      .filter(([k, v]) => k.length > 0 && v.length > 0);

    if (entries.length === 0) {
      return undefined;
    }

    return Object.fromEntries(entries);
  }

  private normalizeRowKeys(
    row: Record<string, unknown>,
  ): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[this.normalizeKey(key)] = value;
    }
    return normalized;
  }

  private pickRowValue(row: Record<string, unknown>, keys: string[]): unknown {
    for (const key of keys) {
      const normalizedKey = this.normalizeKey(key);
      if (normalizedKey in row) {
        return row[normalizedKey];
      }
    }
    return undefined;
  }

  private normalizeKey(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '_');
  }

  private normalizeText(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    const repaired = this.repairMojibake(trimmed);
    return repaired.trim();
  }

  private repairMojibake(value: string): string {
    const suspicious = /[ÃÄÅÆÐØÞáºá»]/.test(value);
    if (!suspicious) {
      return value;
    }

    try {
      const repaired = Buffer.from(value, 'latin1').toString('utf8');
      const repairedLooksBetter =
        /[\u00C0-\u024F\u1E00-\u1EFF\u4E00-\u9FFF]/.test(repaired) &&
        !/[ÃÄÅÆÐØÞ]/.test(repaired);

      return repairedLooksBetter ? repaired : value;
    } catch {
      return value;
    }
  }

  private escapeCsv(value: string): string {
    const normalized = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const escaped = normalized.replace(/"/g, '""');
    return `"${escaped}"`;
  }
}
