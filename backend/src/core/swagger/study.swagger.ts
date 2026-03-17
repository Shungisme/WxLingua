import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

export class StudySwagger {
  static GetNextCardsDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'Get next cards to study',
        description:
          'Get cards by review mode. mode=review returns due cards only, mode=learn returns learning queue.',
      }),
      ApiQuery({
        name: 'deckId',
        required: false,
        description: 'Deck id to study by deck context',
      }),
      ApiQuery({
        name: 'limit',
        required: false,
        description: 'Max number of cards to return',
      }),
      ApiQuery({
        name: 'mode',
        required: false,
        schema: { type: 'string', enum: ['learn', 'review'] },
      }),
      ApiResponse({
        status: 200,
        description: 'Cards retrieved successfully',
        schema: {
          example: [
            {
              id: 'card_1',
              cardId: 'card_1',
              state: 'REVIEW',
              nextReview: '2026-03-15T08:00:00.000Z',
              word: {
                id: 'word_123',
                word: '你好',
                metadata: { pinyin: 'ni hao' },
              },
            },
          ],
        },
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static LogSessionDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'Log a study session',
        description:
          'Submit rating (1-4) for card or word and update next review schedule.',
      }),
      ApiResponse({
        status: 201,
        description: 'Session logged successfully',
        schema: {
          example: {
            id: 'card_1',
            state: 'REVIEW',
            nextReview: '2026-03-20T08:00:00.000Z',
            stability: 4.5,
            difficulty: 5.3,
          },
        },
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static UndoLastDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({ summary: 'Undo the latest study review' }),
      ApiResponse({
        status: 200,
        description: 'Undo successful',
        schema: { example: { message: 'Successfully undone last review.' } },
      }),
      ApiResponse({ status: 404, description: 'No review to undo' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static GetStatsDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({ summary: 'Get study statistics' }),
      ApiResponse({
        status: 200,
        description: 'Stats retrieved successfully',
        schema: {
          example: {
            totalLearned: 320,
            dueToday: 46,
            totalReviews: 5200,
            todayReviews: 58,
          },
        },
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static GetDailyStatsDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({ summary: 'Get daily study statistics' }),
      ApiQuery({
        name: 'days',
        required: false,
        description: 'How many days back to aggregate',
      }),
      ApiResponse({
        status: 200,
        description: 'Daily stats retrieved successfully',
        schema: {
          example: [
            { date: '2026-03-10', count: 34 },
            { date: '2026-03-11', count: 50 },
          ],
        },
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static GetForecastDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({ summary: 'Get due forecast in upcoming days' }),
      ApiQuery({
        name: 'days',
        required: false,
        description: 'How many forecast days to return',
      }),
      ApiResponse({
        status: 200,
        description: 'Forecast retrieved successfully',
        schema: {
          example: [
            { date: '2026-03-15', count: 14 },
            { date: '2026-03-16', count: 21 },
          ],
        },
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static PreviewIntervalsDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({ summary: 'Preview next review intervals' }),
      ApiQuery({
        name: 'wordId',
        required: true,
        description: 'Word id to preview intervals',
      }),
      ApiResponse({
        status: 200,
        description: 'Preview generated successfully',
        schema: {
          example: {
            1: { days: 0, label: '10 min' },
            2: { days: 2, label: '2 days' },
            3: { days: 5, label: '5 days' },
            4: { days: 9, label: '9 days' },
          },
        },
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }
}
