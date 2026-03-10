import { Injectable } from '@nestjs/common';
import { CardState } from '@prisma/client';

// ---------------------------------------------------------------------------
// FSRS-5 Spaced Repetition Scheduling Algorithm
// Implements the Free Spaced Repetition Scheduler (v5) in TypeScript.
// Paper: https://github.com/open-spaced-repetition/fsrs4anki/wiki
// ---------------------------------------------------------------------------

export const FSRS_PARAMS = [
  0.4072,
  1.1829,
  3.1262,
  15.4722,
  7.2102,
  0.5316,
  1.0651,
  0.06,
  1.5449,
  0.14,
  1.0046,
  1.9415,
  0.11,
  0.29,
  2.2668,
  0.1544,
  3.0,
  0.0,
  0.5, // FSRS-5 default weights (w0..w18)
] as const;

const DEFAULT_DESIRED_RETENTION = 0.9; // Target recall probability

/** Rating enum: 1=Again 2=Hard 3=Good 4=Easy */
export type Rating = 1 | 2 | 3 | 4;

export interface SrsCard {
  stability: number; // Memory stability in days
  difficulty: number; // 1–10
  lapses: number;
  state: CardState;
  streak: number;
  efactor: number;
  nextReview: Date;
  lastReview?: Date;
}

export interface SchedulingResult {
  stability: number;
  difficulty: number;
  scheduledDays: number;
  elapsedDays: number;
  nextReview: Date;
  state: CardState;
}

@Injectable()
export class SrsService {
  private readonly w = FSRS_PARAMS;
  private readonly desiredRetention = DEFAULT_DESIRED_RETENTION;

  // -------------------------------------------------------------------------
  // Initial stability by rating (s₀ lookup table)
  // -------------------------------------------------------------------------
  private initialStability(rating: Rating): number {
    // w[0..3] = initial stability for ratings 1,2,3,4
    return Math.max(this.w[rating - 1], 0.1);
  }

  // -------------------------------------------------------------------------
  // Initial difficulty by rating
  // D₀(r) = w[4] - exp(w[5] * (r - 1)) + 1
  // -------------------------------------------------------------------------
  private initialDifficulty(rating: Rating): number {
    const d = this.w[4] - Math.exp(this.w[5] * (rating - 1)) + 1;
    return this.clampDifficulty(d);
  }

  // -------------------------------------------------------------------------
  // Next difficulty after recall/forget
  // ΔD = -w[6] * (r - 3)
  // D' = D + ΔD * (10 - D) / 9
  // -------------------------------------------------------------------------
  private nextDifficulty(d: number, rating: Rating): number {
    const delta = -this.w[6] * (rating - 3);
    const meanReversion = this.w[7] * (this.initialDifficulty(4) - d);
    return this.clampDifficulty(d + delta + meanReversion);
  }

  private clampDifficulty(d: number): number {
    return Math.min(Math.max(d, 1), 10);
  }

  // -------------------------------------------------------------------------
  // Stability after successful recall
  // Sᵣ(D,S,R,r) = S * (e^w8 * (11-D) * S^(-w9) * (e^(w10*(1-R)) - 1) * g(r) + 1)
  // -------------------------------------------------------------------------
  private stabilityAfterRecall(
    d: number,
    s: number,
    r: number,
    rating: Rating,
  ): number {
    const hardPenalty = rating === 2 ? this.w[15] : 1;
    const easyBonus = rating === 4 ? this.w[16] : 1;
    const newS =
      s *
      (Math.exp(this.w[8]) *
        (11 - d) *
        Math.pow(s, -this.w[9]) *
        (Math.exp((1 - r) * this.w[10]) - 1) *
        hardPenalty *
        easyBonus +
        1);
    return Math.max(newS, 0.1);
  }

  // -------------------------------------------------------------------------
  // Stability after forgetting (lapse)
  // Sf(D,S,R) = w[11] * D^(-w[12]) * ((S+1)^w[13] - 1) * e^(w[14]*(1-R))
  // -------------------------------------------------------------------------
  private stabilityAfterForgetting(d: number, s: number, r: number): number {
    const newS =
      this.w[11] *
      Math.pow(d, -this.w[12]) *
      (Math.pow(s + 1, this.w[13]) - 1) *
      Math.exp((1 - r) * this.w[14]);
    return Math.max(newS, 0.1);
  }

  // -------------------------------------------------------------------------
  // Retrievability (recall probability given elapsed days and stability)
  // R(t, S) = (1 + DECAY * t / S)^(FACTOR)
  // -------------------------------------------------------------------------
  private retrievability(elapsedDays: number, stability: number): number {
    const DECAY = -0.5;
    const FACTOR = Math.pow(0.9, 1 / DECAY) - 1;
    return Math.pow(1 + FACTOR * (elapsedDays / stability), DECAY);
  }

  // -------------------------------------------------------------------------
  // Interval in days at which recall probability equals desiredRetention
  // I(S) = S / FACTOR * (R^(1/DECAY) - 1)
  // -------------------------------------------------------------------------
  private nextInterval(stability: number): number {
    const DECAY = -0.5;
    const FACTOR = Math.pow(this.desiredRetention, 1 / DECAY) - 1;
    const interval =
      (stability / FACTOR) * (Math.pow(this.desiredRetention, 1 / DECAY) - 1);
    // Fuzz ±10% to spread reviews
    const fuzz = 0.9 + Math.random() * 0.2;
    return Math.max(Math.round(stability * fuzz), 1);
  }

  // -------------------------------------------------------------------------
  // Main scheduling entry point
  // -------------------------------------------------------------------------
  schedule(
    card: SrsCard,
    rating: Rating,
    timeTakenMs: number,
  ): SchedulingResult {
    const now = new Date();
    const elapsedDays = card.lastReview
      ? Math.max(
          0,
          Math.round(
            (now.getTime() -
              (card.nextReview.getTime() - card.stability * 86400000)) /
              86400000,
          ),
        )
      : 0;

    let { stability, difficulty, state } = card;
    let scheduledDays: number;
    let nextState: CardState;

    switch (state) {
      case CardState.NEW: {
        // First review — initialise from rating
        stability = this.initialStability(rating);
        difficulty = this.initialDifficulty(rating);

        if (rating === 1) {
          // Again: stay in LEARNING, short interval (1 min → next day)
          scheduledDays = 0;
          nextState = CardState.LEARNING;
        } else {
          scheduledDays = this.nextInterval(stability);
          nextState = CardState.REVIEW;
        }
        break;
      }

      case CardState.LEARNING:
      case CardState.RELEARNING: {
        if (rating === 1) {
          // Still failing — keep in learning
          stability = this.stabilityAfterForgetting(
            difficulty,
            Math.max(stability, 0.1),
            1,
          );
          scheduledDays = 0;
          nextState = state;
        } else {
          // Graduated to review
          stability = this.initialStability(rating);
          difficulty = this.nextDifficulty(difficulty, rating);
          scheduledDays = this.nextInterval(stability);
          nextState = CardState.REVIEW;
        }
        break;
      }

      case CardState.REVIEW: {
        const r = this.retrievability(elapsedDays, stability);
        difficulty = this.nextDifficulty(difficulty, rating);

        if (rating === 1) {
          // Lapse
          stability = this.stabilityAfterForgetting(difficulty, stability, r);
          scheduledDays = 0;
          nextState = CardState.RELEARNING;
        } else {
          // Correct recall
          stability = this.stabilityAfterRecall(
            difficulty,
            stability,
            r,
            rating,
          );
          scheduledDays = this.nextInterval(stability);
          nextState = CardState.REVIEW;
        }
        break;
      }
    }

    const nextReview = new Date();
    if (scheduledDays === 0) {
      // Learning step: review again in 10 minutes
      nextReview.setMinutes(nextReview.getMinutes() + 10);
    } else {
      nextReview.setDate(nextReview.getDate() + scheduledDays);
    }

    return {
      stability,
      difficulty,
      scheduledDays,
      elapsedDays,
      nextReview,
      state: nextState,
    };
  }

  /**
   * Preview estimated intervals for each rating WITHOUT modifying state.
   * Used by the frontend to show "Again: 10m | Hard: 3d | Good: 7d | Easy: 21d".
   */
  previewIntervals(
    card: SrsCard,
  ): Record<Rating, { days: number; label: string }> {
    const ratings: Rating[] = [1, 2, 3, 4];
    const result = {} as Record<Rating, { days: number; label: string }>;

    for (const r of ratings) {
      const res = this.schedule(card, r, 0);
      result[r] = {
        days: res.scheduledDays,
        label: this.formatInterval(res.scheduledDays),
      };
    }
    return result;
  }

  private formatInterval(days: number): string {
    if (days === 0) return '10 min';
    if (days === 1) return '1 day';
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  }
}
