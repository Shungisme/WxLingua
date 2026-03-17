import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';
import {
  SearchDictionaryDto,
  SearchType,
} from '../../../core/dtos/dictionary/search-dictionary.dto';
import {
  DictionaryWordDto,
  SearchResultDto,
} from '../../../core/dtos/dictionary/dictionary-response.dto';
import { Prisma, Word } from '@prisma/client';

@Injectable()
export class DictionaryService {
  constructor(private prisma: PrismaService) {}

  async search(dto: SearchDictionaryDto): Promise<SearchResultDto> {
    const { q, language, limit = 50 } = dto;

    const words = await this.prisma.word.findMany({
      where: this.buildWordSearch(q, language),
      take: limit * 3,
      orderBy: [{ frequency: 'desc' }, { word: 'asc' }],
    });

    // Sort by relevance score and take top results
    const sortedWords = this.sortByRelevance(words, q);
    const topWords = sortedWords.slice(0, limit);

    return {
      words: topWords as DictionaryWordDto[],
      total: topWords.length,
      query: q,
      searchType: SearchType.CHARACTER,
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

  private buildWordSearch(
    query: string,
    language: string | undefined,
  ): Prisma.WordWhereInput {
    return {
      languageCode: language,
      word: {
        contains: query,
        mode: 'insensitive',
      },
    };
  }

  // Relevance scoring and sorting
  private sortByRelevance(words: Word[], query: string): Word[] {
    const scoredWords = words.map((word) => ({
      word,
      score: this.calculateRelevanceScore(word, query),
    }));

    // Sort by score descending (higher score = more relevant)
    scoredWords.sort((a, b) => b.score - a.score);

    return scoredWords.map(({ word }) => word);
  }

  private calculateRelevanceScore(word: Word, query: string): number {
    let score = 0;

    const wordText = word.word || '';

    // Normalize query for comparison
    const normalizedQuery = query.toLowerCase().trim();
    score = this.scoreWordMatch(wordText, normalizedQuery);

    // Add frequency bonus (normalize to 0-10 range)
    score += (typeof word.frequency === 'number' ? word.frequency : 0) / 100;

    // Subtract length penalty (prefer shorter words for short queries)
    score -= wordText.length * 0.5;

    return score;
  }

  private scoreWordMatch(word: string, query: string): number {
    // Exact match - highest priority
    if (word === query) {
      return 1000;
    }

    // Starts with - high priority
    if (word.startsWith(query)) {
      return 500;
    }

    // Contains - base score
    if (word.includes(query)) {
      return 100;
    }

    return 0;
  }
}
