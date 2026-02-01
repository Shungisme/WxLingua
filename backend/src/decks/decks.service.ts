import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeckDto } from './dto/create-deck.dto';

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

  async findAll(userId: string, query: any) {
    // If querying public decks:
    if (query.public === 'true') {
      return this.prisma.deck.findMany({
        where: { isPublic: true },
        include: { user: { select: { name: true, avatar: true } } },
      });
    }
    // Else return user's decks
    return this.prisma.deck.findMany({
      where: { userId },
    });
  }

  async findOne(id: string) {
    const deck = await this.prisma.deck.findUnique({
      where: { id },
      include: {
        deckWords: {
          include: { word: true },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!deck) throw new NotFoundException('Deck not found');
    return deck;
  }

  async addWords(userId: string, deckId: string, wordIds: string[]) {
    const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) throw new NotFoundException('Deck not found');
    if (deck.userId !== userId) throw new ForbiddenException('Not your deck');

    // Add words
    await Promise.all(
      wordIds.map((wordId, index) =>
        this.prisma.deckWord.create({
          data: {
            deckId,
            wordId,
            position: deck.cardCount + index,
          },
        }).catch(() => null) // Ignore duplicates
      )
    );

    // Update count
    const count = await this.prisma.deckWord.count({ where: { deckId } });
    return this.prisma.deck.update({
      where: { id: deckId },
      data: { cardCount: count },
    });
  }
}
