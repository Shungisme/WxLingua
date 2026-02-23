import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchDictionaryDto, SearchType } from './dto/search-dictionary.dto';
import {
  DictionaryWordDto,
  SearchResultDto,
} from './dto/dictionary-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DictionaryService {
  constructor(private prisma: PrismaService) {}

  async search(dto: SearchDictionaryDto): Promise<SearchResultDto> {
    const { q, type, language, limit } = dto;

    let whereConditions: Prisma.WordWhereInput[] = [];

    // Base language filter
    const baseFilter: Prisma.WordWhereInput = {
      languageCode: language,
    };

    switch (type) {
      case SearchType.CHARACTER:
        whereConditions = [this.buildCharacterSearch(q, baseFilter)];
        break;

      case SearchType.PINYIN:
        whereConditions = [this.buildPinyinSearch(q, baseFilter)];
        break;

      case SearchType.MEANING:
        whereConditions = [this.buildMeaningSearch(q, baseFilter)];
        break;

      case SearchType.ALL:
      default:
        whereConditions = [
          this.buildCharacterSearch(q, baseFilter),
          this.buildPinyinSearch(q, baseFilter),
          this.buildMeaningSearch(q, baseFilter),
        ];
        break;
    }

    // Execute search with OR conditions
    const words = await this.prisma.word.findMany({
      where: {
        OR: whereConditions,
      },
      take: limit,
      orderBy: [
        { frequency: 'desc' }, // Higher frequency first
        { word: 'asc' },
      ],
    });

    return {
      words: words as DictionaryWordDto[],
      total: words.length,
      query: q,
      searchType: type || SearchType.ALL,
    };
  }

  async getWordById(id: string): Promise<DictionaryWordDto | null> {
    const word = await this.prisma.word.findUnique({
      where: { id },
    });

    return word as DictionaryWordDto | null;
  }

  async getRadicalByChar(char: string) {
    return await this.prisma.radical.findUnique({
      where: { char },
    });
  }

  async listRadicals(limit: number = 214) {
    return await this.prisma.radical.findMany({
      take: limit,
      orderBy: { frequency: 'asc' }, // Lower frequency number = more common
    });
  }

  // Helper methods for building search conditions
  private buildCharacterSearch(
    query: string,
    baseFilter: Prisma.WordWhereInput,
  ): Prisma.WordWhereInput {
    return {
      ...baseFilter,
      OR: [
        // Search in traditional character (word field)
        {
          word: {
            contains: query,
          },
        },
        // Search in simplified character (metadata.simplified)
        {
          metadata: {
            path: ['simplified'],
            string_contains: query,
          },
        },
      ],
    };
  }

  private buildPinyinSearch(
    query: string,
    baseFilter: Prisma.WordWhereInput,
  ): Prisma.WordWhereInput {
    // Remove spaces and convert to lowercase for flexible matching
    const normalizedQuery = query.toLowerCase().replace(/\s+/g, '');

    return {
      ...baseFilter,
      metadata: {
        path: ['pinyin'],
        string_contains: normalizedQuery,
      },
    };
  }

  private buildMeaningSearch(
    query: string,
    baseFilter: Prisma.WordWhereInput,
  ): Prisma.WordWhereInput {
    // Search in the meanings array - this requires checking if any meaning contains the query
    // PostgreSQL JSONB array search
    return {
      ...baseFilter,
      metadata: {
        path: ['meanings'],
        array_contains: [query],
      },
    };
  }
}
