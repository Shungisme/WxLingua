import { Injectable, NotFoundException } from '@nestjs/common';
import { CardState } from '@prisma/client';
import { PrismaService } from '../../prisma/services/prisma.service';
import { StudySessionDto } from '../../../core/dtos/study/study-session.dto';
import { SrsService, type Rating } from './srs.service';

@Injectable()
export class StudyService {
  constructor(
    private prisma: PrismaService,
    private srs: SrsService,
  ) {}

  // ---------------------------------------------------------------------------
  // Get next cards to study
  // mode='learn'  → all cards in the deck, ordered by position (no SRS gate)
  // mode='review' → only cards due now (nextReview ≤ now)
  // Without deckId → uses UserWord SRS (global vocabulary study, unchanged)
  // ---------------------------------------------------------------------------
  async getNextCards(
    userId: string,
    deckId?: string,
    limit: number = 20,
    mode: 'learn' | 'review' = 'review',
  ) {
    const now = new Date();

    // ── Deck-based study: operate on DeckCard SRS ──────────────────────────
    if (deckId) {
      if (mode === 'learn') {
        const cards = await this.prisma.deckCard.findMany({
          where: { deckId },
          take: limit,
          orderBy: { position: 'asc' },
        });
        return cards.map((c) => this.normalizeDeckCard(c));
      }

      // review mode: only cards that are due
      const dueCards = await this.prisma.deckCard.findMany({
        where: { deckId, nextReview: { lte: now } },
        take: limit,
        orderBy: { nextReview: 'asc' },
      });
      return dueCards.map((c) => this.normalizeDeckCard(c));
    }

    // ── Global vocabulary study: operate on UserWord SRS ───────────────────
    const dueCards = await this.prisma.userWord.findMany({
      where: { userId, nextReview: { lte: now } },
      take: limit,
      include: { word: true },
      orderBy: { nextReview: 'asc' },
    });

    const remaining = limit - dueCards.length;
    let newCards: typeof dueCards = [];
    if (remaining > 0) {
      const seenWordIds = await this.prisma.userWord
        .findMany({ where: { userId }, select: { wordId: true } })
        .then((rows) => rows.map((r) => r.wordId));

      const newWords = await this.prisma.word.findMany({
        where: { id: { notIn: seenWordIds } },
        take: remaining,
        orderBy: { frequency: 'asc' },
      });

      newCards = await Promise.all(
        newWords.map(async (word) => {
          const userWord = await this.prisma.userWord.upsert({
            where: { userId_wordId: { userId, wordId: word.id } },
            create: { userId, wordId: word.id },
            update: {},
            include: { word: true },
          });
          return userWord;
        }),
      );
    }

    return [...dueCards, ...newCards];
  }

  // ---------------------------------------------------------------------------
  // Log a review session (apply SRS scheduling)
  // dto.cardId → DeckCard SRS path
  // dto.wordId → UserWord SRS path (legacy / global vocab)
  // ---------------------------------------------------------------------------
  async logSession(userId: string, dto: StudySessionDto) {
    const { rating, timeSpent } = dto;

    // ── Deck card review ─────────────────────────────────────────────────────
    if (dto.cardId) {
      return this.logDeckCardSession(dto.cardId, rating);
    }

    // ── Vocabulary review ────────────────────────────────────────────────────
    const wordId = dto.wordId!;

    let userWord = await this.prisma.userWord.findUnique({
      where: { userId_wordId: { userId, wordId } },
    });
    if (!userWord) {
      userWord = await this.prisma.userWord.create({
        data: { userId, wordId },
      });
    }

    const now = new Date();
    const elapsedDays = userWord.lastReview
      ? Math.max(
          0,
          Math.round(
            (now.getTime() - userWord.lastReview.getTime()) / 86400000,
          ),
        )
      : 0;

    const srsCard = {
      stability: userWord.stability,
      difficulty: userWord.difficulty,
      lapses: userWord.lapses,
      state: userWord.state,
      streak: userWord.streak,
      efactor: userWord.efactor,
      nextReview: userWord.nextReview,
      lastReview: userWord.lastReview ?? undefined,
    };

    const result = this.srs.schedule(srsCard, rating as Rating);

    await this.prisma.reviewLog.create({
      data: {
        userId,
        wordId,
        userWordId: userWord.id,
        rating,
        state: userWord.state,
        scheduledDays: result.scheduledDays,
        elapsedDays,
        timeSpent,
        prevStability: userWord.stability,
        prevDifficulty: userWord.difficulty,
        prevStreak: userWord.streak,
        prevNextReview: userWord.nextReview,
        prevState: userWord.state,
        prevEfactor: userWord.efactor,
      },
    });

    const newStreak = rating >= 3 ? userWord.streak + 1 : 0;
    const newLapses = rating === 1 ? userWord.lapses + 1 : userWord.lapses;
    const mastery = Math.min(1, result.scheduledDays / 100);

    return this.prisma.userWord.update({
      where: { id: userWord.id },
      data: {
        stability: result.stability,
        difficulty: result.difficulty,
        state: result.state,
        lapses: newLapses,
        streak: newStreak,
        nextReview: result.nextReview,
        lastReview: now,
        progress: mastery,
      },
      include: { word: true },
    });
  }

  // ---------------------------------------------------------------------------
  // DeckCard SRS update (no ReviewLog – deck is user-scoped)
  // ---------------------------------------------------------------------------
  private async logDeckCardSession(cardId: string, rating: number) {
    const card = await this.prisma.deckCard.findUnique({
      where: { id: cardId },
    });
    if (!card) throw new NotFoundException('Deck card not found');

    const now = new Date();
    const srsCard = {
      stability: card.stability,
      difficulty: card.difficulty,
      lapses: card.lapses,
      state: card.state,
      streak: card.streak,
      efactor: card.efactor,
      nextReview: card.nextReview,
      lastReview: card.lastReview ?? undefined,
    };

    const result = this.srs.schedule(srsCard, rating as Rating);
    const newStreak = rating >= 3 ? card.streak + 1 : 0;
    const newLapses = rating === 1 ? card.lapses + 1 : card.lapses;
    const mastery = Math.min(1, result.scheduledDays / 100);

    const updated = await this.prisma.deckCard.update({
      where: { id: cardId },
      data: {
        stability: result.stability,
        difficulty: result.difficulty,
        state: result.state,
        lapses: newLapses,
        streak: newStreak,
        nextReview: result.nextReview,
        lastReview: now,
        progress: mastery,
      },
    });

    return this.normalizeDeckCard(updated);
  }

  // ---------------------------------------------------------------------------
  // Normalize a DeckCard into the StudyCard shape the frontend expects
  // ---------------------------------------------------------------------------
  private normalizeDeckCard(card: {
    id: string;
    term: string;
    meaning: unknown;
    pronunciation: string | null;
    imageUrl: string | null;
    audioUrl: string | null;
    progress: number;
    streak: number;
    nextReview: Date;
    stability: number;
    difficulty: number;
    lapses: number;
    state: string;
  }) {
    const meta: Record<string, unknown> = {};
    if (card.pronunciation) meta['pinyin'] = card.pronunciation;
    if (card.meaning && typeof card.meaning === 'object') {
      Object.assign(meta, card.meaning);
    }

    return {
      id: card.id,
      cardId: card.id,
      progress: card.progress,
      streak: card.streak,
      nextReview: card.nextReview,
      state: card.state,
      stability: card.stability,
      difficulty: card.difficulty,
      lapses: card.lapses,
      word: {
        id: card.id,
        word: card.term,
        metadata: meta,
        imageUrl: card.imageUrl,
        audioUrl: card.audioUrl,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Undo the most recent review for this user
  // ---------------------------------------------------------------------------
  async undoLast(userId: string) {
    const log = await this.prisma.reviewLog.findFirst({
      where: { userId },
      orderBy: { reviewedAt: 'desc' },
    });

    if (!log) throw new NotFoundException('No review to undo.');

    // Restore previous state
    await this.prisma.userWord.update({
      where: { id: log.userWordId },
      data: {
        stability: log.prevStability,
        difficulty: log.prevDifficulty,
        streak: log.prevStreak,
        nextReview: log.prevNextReview ?? new Date(),
        state: log.prevState,
        efactor: log.prevEfactor,
        lapses: {
          decrement: log.rating === 1 ? 1 : 0,
        },
      },
    });

    await this.prisma.reviewLog.delete({ where: { id: log.id } });

    return { message: 'Successfully undone last review.' };
  }

  // ---------------------------------------------------------------------------
  // Stats: overview counters
  // ---------------------------------------------------------------------------
  async getStats(userId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalLearned, dueToday, totalReviews, todayReviews] =
      await Promise.all([
        this.prisma.userWord.count({
          where: { userId, state: CardState.REVIEW },
        }),
        this.prisma.userWord.count({
          where: { userId, nextReview: { lte: now } },
        }),
        this.prisma.reviewLog.count({ where: { userId } }),
        this.prisma.reviewLog.count({
          where: { userId, reviewedAt: { gte: today, lt: tomorrow } },
        }),
      ]);

    return { totalLearned, dueToday, totalReviews, todayReviews };
  }

  // ---------------------------------------------------------------------------
  // Daily stats: per-day review counts for the past N days (heatmap)
  // ---------------------------------------------------------------------------
  async getDailyStats(userId: string, days: number = 84) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await this.prisma.reviewLog.findMany({
      where: { userId, reviewedAt: { gte: since } },
      select: { reviewedAt: true },
    });

    // Aggregate by date string (YYYY-MM-DD)
    const map = new Map<string, number>();
    for (const log of logs) {
      const key = log.reviewedAt.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  }

  // ---------------------------------------------------------------------------
  // Forecast: how many cards are due in the next N days
  // ---------------------------------------------------------------------------
  async getForecast(userId: string, days: number = 14) {
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);

    const upcoming = await this.prisma.userWord.findMany({
      where: { userId, nextReview: { gte: now, lte: end } },
      select: { nextReview: true },
    });

    const map = new Map<string, number>();
    for (const uw of upcoming) {
      const key = uw.nextReview.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    // Fill gaps with 0
    const result: { date: string; count: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, count: map.get(key) ?? 0 });
    }
    return result;
  }

  // ---------------------------------------------------------------------------
  // Preview intervals for the current card without modifying state
  // ---------------------------------------------------------------------------
  async previewIntervals(userId: string, wordId: string) {
    const userWord = await this.prisma.userWord.findUnique({
      where: { userId_wordId: { userId, wordId } },
    });

    const card = userWord
      ? {
          stability: userWord.stability,
          difficulty: userWord.difficulty,
          lapses: userWord.lapses,
          state: userWord.state,
          streak: userWord.streak,
          efactor: userWord.efactor,
          nextReview: userWord.nextReview,
          lastReview: userWord.lastReview ?? undefined,
        }
      : {
          stability: 0,
          difficulty: 5,
          lapses: 0,
          state: CardState.NEW,
          streak: 0,
          efactor: 2.5,
          nextReview: new Date(),
          lastReview: undefined,
        };

    return this.srs.previewIntervals(card);
  }
}
