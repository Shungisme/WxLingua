import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckCardDto } from './dto/update-deck-card.dto';

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

  async findAll(userId: string | undefined, query: any) {
    if (query.public === 'true') {
      return this.prisma.deck.findMany({
        where: { isPublic: true },
        include: { user: { select: { name: true, avatar: true } } },
      });
    }

    if (!userId) return [];

    return this.prisma.deck.findMany({
      where: { userId },
    });
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
              imageUrl: word.audioUrl ?? undefined, // no imageUrl on Word – skip
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
}
