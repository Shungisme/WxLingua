import { Injectable, NotFoundException } from '@nestjs/common';
import { CardState } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StudySessionDto } from './dto/study-session.dto';
import { SrsService, type Rating } from './srs.service';

@Injectable()
export class StudyService {
  constructor(
    private prisma: PrismaService,
    private srs: SrsService,
  ) {}

  // ---------------------------------------------------------------------------
  // Get next cards to review (due cards + new cards to fill the limit)
  // ---------------------------------------------------------------------------
  async getNextCards(userId: string, deckId?: string, limit: number = 20) {
    const now = new Date();

    // 1. Collect wordIds scoped to a deck if provided
    let deckWordIds: string[] | undefined;
    if (deckId) {
      const rows = await this.prisma.deckWord.findMany({
        where: { deckId },
        select: { wordId: true },
      });
      deckWordIds = rows.map((r) => r.wordId);
      if (deckWordIds.length === 0) return [];
    }

    // 2. Due cards (nextReview ≤ now)
    const dueCards = await this.prisma.userWord.findMany({
      where: {
        userId,
        nextReview: { lte: now },
        ...(deckWordIds ? { wordId: { in: deckWordIds } } : {}),
      },
      take: limit,
      include: { word: true },
      orderBy: { nextReview: 'asc' },
    });

    // 3. Fill remaining slots with new words not yet encountered
    const remaining = limit - dueCards.length;
    let newCards: typeof dueCards = [];
    if (remaining > 0) {
      const seenWordIds = await this.prisma.userWord
        .findMany({ where: { userId }, select: { wordId: true } })
        .then((rows) => rows.map((r) => r.wordId));

      const newWords = await this.prisma.word.findMany({
        where: {
          id: { notIn: seenWordIds },
          ...(deckWordIds ? { id: { in: deckWordIds } } : {}),
        },
        take: remaining,
        orderBy: { frequency: 'asc' },
      });

      // Create placeholder UserWord rows for new words
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
  // ---------------------------------------------------------------------------
  async logSession(userId: string, dto: StudySessionDto) {
    const { wordId, rating, timeSpent } = dto;

    // Find or create the UserWord entry
    let userWord = await this.prisma.userWord.findUnique({
      where: { userId_wordId: { userId, wordId } },
    });
    if (!userWord) {
      userWord = await this.prisma.userWord.create({
        data: { userId, wordId },
      });
    }

    const now = new Date();

    // Compute elapsed days since last review
    const elapsedDays = userWord.lastReview
      ? Math.max(
          0,
          Math.round(
            (now.getTime() - userWord.lastReview.getTime()) / 86400000,
          ),
        )
      : 0;

    // Run the SRS algorithm
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

    const result = this.srs.schedule(srsCard, rating as Rating, timeSpent);

    // Write a ReviewLog snapshot (for undo)
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

    // Update streak
    const newStreak = rating >= 3 ? userWord.streak + 1 : 0;
    const newLapses = rating === 1 ? userWord.lapses + 1 : userWord.lapses;
    const mastery = Math.min(1, result.scheduledDays / 100); // rough 0-1 mastery

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
