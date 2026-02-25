import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchDictionaryDto, SearchType } from './dto/search-dictionary.dto';
import {
  DictionaryWordDto,
  SearchResultDto,
} from './dto/dictionary-response.dto';
import { Prisma } from '@prisma/client';
import { normalizePinyin } from '../../database/utils/pinyin-converter';

@Injectable()
export class DictionaryService {
  constructor(private prisma: PrismaService) {}

  async search(dto: SearchDictionaryDto): Promise<SearchResultDto> {
    const { q, type, language, limit = 50 } = dto;

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

    // Execute search with OR conditions - fetch more to ensure we get best matches
    const words = await this.prisma.word.findMany({
      where: {
        OR: whereConditions,
      },
      take: limit * 3, // Fetch more candidates for better relevance sorting
      orderBy: [
        { frequency: 'desc' }, // Initial ordering by frequency
        { word: 'asc' },
      ],
    });

    // Sort by relevance score and take top results
    const sortedWords = this.sortByRelevance(words, q, type || SearchType.ALL);
    const topWords = sortedWords.slice(0, limit);

    return {
      words: topWords as DictionaryWordDto[],
      total: topWords.length,
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
        // Search in traditional character (word field) - prefix match for index usage
        {
          word: {
            startsWith: query,
          },
        },
        // Search in simplified character (metadata.simplified) - prefix match for index usage
        {
          metadata: {
            path: ['simplified'],
            string_starts_with: query,
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
    const normalizedQuery = normalizePinyin(query.replace(/\s+/g, ''));

    // Use normalized pinyin for accent-insensitive prefix matching
    // This allows index usage while supporting searches like "ni" matching "nǐ hǎo"
    return {
      ...baseFilter,
      metadata: {
        path: ['pinyinNormalized'],
        string_starts_with: normalizedQuery, // Prefix match for index usage
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

  // Relevance scoring and sorting
  private sortByRelevance(
    words: any[],
    query: string,
    searchType: SearchType,
  ): any[] {
    const scoredWords = words.map((word) => ({
      word,
      score: this.calculateRelevanceScore(word, query, searchType),
    }));

    // Sort by score descending (higher score = more relevant)
    scoredWords.sort((a, b) => b.score - a.score);

    return scoredWords.map(({ word }) => word);
  }

  private calculateRelevanceScore(
    word: any,
    query: string,
    searchType: SearchType,
  ): number {
    let score = 0;

    const metadata = word.metadata as any;
    const wordText = word.word || '';
    const simplified = metadata?.simplified || '';
    const pinyin = metadata?.pinyin || '';
    const meanings = (metadata?.meanings || []) as string[];

    // Normalize query for comparison
    const normalizedQuery = query.toLowerCase().trim();
    const normalizedPinyin = pinyin.toLowerCase().replace(/\s+/g, '');
    const queryNoPinyin = normalizedQuery.replace(/\s+/g, '');

    switch (searchType) {
      case SearchType.CHARACTER:
        score = this.scoreCharacterMatch(wordText, simplified, normalizedQuery);
        break;

      case SearchType.PINYIN:
        score = this.scorePinyinMatch(normalizedPinyin, queryNoPinyin);
        break;

      case SearchType.MEANING:
        score = this.scoreMeaningMatch(meanings, normalizedQuery);
        break;

      case SearchType.ALL:
      default:
        // Take the best score from all search types
        score = Math.max(
          this.scoreCharacterMatch(wordText, simplified, normalizedQuery),
          this.scorePinyinMatch(normalizedPinyin, queryNoPinyin),
          this.scoreMeaningMatch(meanings, normalizedQuery),
        );
        break;
    }

    // Add frequency bonus (normalize to 0-10 range)
    score += (word.frequency || 0) / 100;

    // Subtract length penalty (prefer shorter words for short queries)
    score -= wordText.length * 0.5;

    return score;
  }

  private scoreCharacterMatch(
    word: string,
    simplified: string,
    query: string,
  ): number {
    // Exact match - highest priority
    if (word === query || simplified === query) {
      return 1000;
    }

    // Starts with - high priority
    if (word.startsWith(query) || simplified.startsWith(query)) {
      return 500;
    }

    // Contains - base score
    if (word.includes(query) || simplified.includes(query)) {
      return 100;
    }

    return 0;
  }

  private scorePinyinMatch(pinyin: string, query: string): number {
    // Normalize both pinyin and query for accent-insensitive comparison
    const normalizedPinyin = normalizePinyin(pinyin);
    const normalizedQuery = normalizePinyin(query);

    // Exact match (after normalization)
    if (normalizedPinyin === normalizedQuery) {
      return 1000;
    }

    // Starts with (after normalization)
    if (normalizedPinyin.startsWith(normalizedQuery)) {
      return 500;
    }

    // Contains (after normalization)
    if (normalizedPinyin.includes(normalizedQuery)) {
      return 100;
    }

    return 0;
  }

  private scoreMeaningMatch(meanings: string[], query: string): number {
    if (meanings.length === 0) {
      return 0;
    }

    for (const meaning of meanings) {
      const normalizedMeaning = meaning.toLowerCase();

      // Exact match
      if (normalizedMeaning === query) {
        return 1000;
      }

      // Starts with
      if (normalizedMeaning.startsWith(query)) {
        return 500;
      }

      // Contains
      if (normalizedMeaning.includes(query)) {
        return 100;
      }
    }

    return 0;
  }
}
