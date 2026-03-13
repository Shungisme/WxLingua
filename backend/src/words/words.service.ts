import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWordDto } from './dto/create-word.dto';
import { StorageService } from '../common/storage/storage.service';

@Injectable()
export class WordsService {
  constructor(
    private prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

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
          }),
        ),
      );
    }

    return this.findOne(word.id);
  }

  async findAll(query: any) {
    const { language, level, limit, cursorId, q } = query;
    const where: any = {};
    if (language) where.languageCode = language;
    if (level) where.level = level;
    if (q) {
      where.OR = [{ word: { contains: q, mode: 'insensitive' } }];
    }

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
    const word = await this.prisma.word.findUnique({ where: { id } });
    if (!word) throw new NotFoundException('Word not found');

    if (word.audioUrl && word.audioUrl !== audioUrl) {
      await this.storageService
        .deleteObjectByUrl(word.audioUrl)
        .catch(() => null);
    }

    return this.prisma.word.update({
      where: { id },
      data: { audioUrl },
    });
  }

  async uploadAudio(id: string, file: Express.Multer.File) {
    const word = await this.prisma.word.findUnique({ where: { id } });
    if (!word) throw new NotFoundException('Word not found');

    const uploaded = await this.storageService.uploadAudio(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    if (word.audioUrl) {
      await this.storageService
        .deleteObjectByUrl(word.audioUrl)
        .catch(() => null);
    }

    return this.prisma.word.update({
      where: { id },
      data: { audioUrl: uploaded.url },
    });
  }

  async deleteAudio(id: string) {
    const word = await this.prisma.word.findUnique({ where: { id } });
    if (!word) throw new NotFoundException('Word not found');

    if (word.audioUrl) {
      await this.storageService
        .deleteObjectByUrl(word.audioUrl)
        .catch(() => null);
    }

    return this.prisma.word.update({
      where: { id },
      data: { audioUrl: null },
    });
  }
}
