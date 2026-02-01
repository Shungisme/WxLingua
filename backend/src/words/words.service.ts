import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWordDto } from './dto/create-word.dto';

@Injectable()
export class WordsService {
  constructor(private prisma: PrismaService) {}

  async create(createWordDto: CreateWordDto) {
    const { radicalIds, ...data } = createWordDto;
    
    // Create word
    const word = await this.prisma.word.create({
      data: {
        ...data,
        metadata: data.metadata || {},
      },
    });

    // Create relations if radicalIds present
    if (radicalIds && radicalIds.length > 0) {
      await Promise.all(
        radicalIds.map((radicalId, index) =>
          this.prisma.wordRadical.create({
            data: {
              wordId: word.id,
              radicalId,
              position: index,
            },
          })
        )
      );
    }

    return this.findOne(word.id);
  }

  async findAll(query: any) {
    const { language, level, limit, cursorId } = query;
    const where: any = {};
    if (language) where.languageCode = language;
    if (level) where.level = level;

    const take = limit ? parseInt(limit) : 20;

    return this.prisma.word.findMany({
      where,
      take,
      skip: cursorId ? 1 : 0,
      cursor: cursorId ? { id: cursorId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const word = await this.prisma.word.findUnique({
      where: { id },
      include: {
        wordRadicals: {
          include: { radical: true },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!word) throw new NotFoundException('Word not found');
    return word;
  }

  async updateAudio(id: string, audioUrl: string) {
    return this.prisma.word.update({
      where: { id },
      data: { audioUrl },
    });
  }
}
