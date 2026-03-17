import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

export class DecksSwagger {
  static CreateDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'Create a new deck',
        description:
          'Create a deck owned by current user. Supports optional description, languageCode and visibility.',
      }),
      ApiResponse({
        status: 201,
        description: 'Deck created successfully',
        schema: {
          example: {
            id: 'deck_123',
            userId: 'user_123',
            name: 'HSK 1 Basics',
            description: 'Core beginner words',
            languageCode: 'zh-TW',
            isPublic: false,
            cardCount: 0,
            createdAt: '2026-03-14T10:30:00.000Z',
            updatedAt: '2026-03-14T10:30:00.000Z',
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Validation error',
        schema: {
          oneOf: [
            {
              example: {
                message: ['name should not be empty'],
                error: 'Bad Request',
                statusCode: 400,
              },
            },
            {
              example: {
                message: ['languageCode must be a string'],
                error: 'Bad Request',
                statusCode: 400,
              },
            },
          ],
        },
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static FindAllDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'List decks',
        description:
          'List current user decks by default. Use query public=true to list public decks with owner info.',
      }),
      ApiQuery({
        name: 'public',
        required: false,
        description: 'Set true to list public decks',
        schema: { type: 'string', enum: ['true', 'false'] },
      }),
      ApiResponse({
        status: 200,
        description: 'Decks retrieved successfully',
        schema: {
          example: [
            {
              id: 'deck_123',
              name: 'HSK 1 Basics',
              isPublic: false,
              cardCount: 120,
              dueCount: 18,
            },
          ],
        },
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static FindOneDecorators() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get deck with cards',
        description: 'Get a deck and all its cards ordered by position.',
      }),
      ApiParam({ name: 'id', description: 'Deck id' }),
      ApiResponse({
        status: 200,
        description: 'Deck retrieved successfully',
        schema: {
          example: {
            id: 'deck_123',
            name: 'HSK 1 Basics',
            deckCards: [
              {
                id: 'card_1',
                term: '你好',
                meaning: { en: 'hello' },
                pronunciation: 'ni hao',
                position: 0,
              },
            ],
          },
        },
      }),
      ApiResponse({ status: 404, description: 'Deck not found' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static AddWordsDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'Add dictionary words to a deck',
        description:
          'Copy dictionary words into deck cards. Duplicated terms in the same deck are ignored.',
      }),
      ApiParam({ name: 'id', description: 'Deck id' }),
      ApiResponse({
        status: 200,
        description: 'Words added successfully',
        schema: { example: { id: 'deck_123', cardCount: 145 } },
      }),
      ApiResponse({
        status: 400,
        description: 'Validation error',
        schema: {
          oneOf: [
            {
              example: {
                message: ['wordIds must be an array'],
                error: 'Bad Request',
                statusCode: 400,
              },
            },
            {
              example: {
                message: ['each value in wordIds must be a string'],
                error: 'Bad Request',
                statusCode: 400,
              },
            },
          ],
        },
      }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 404, description: 'Deck not found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static UpdateCardDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'Update deck card content',
        description:
          'Update any editable fields of a card including term, meaning, pronunciation, media and notes.',
      }),
      ApiParam({ name: 'id', description: 'Deck id' }),
      ApiParam({ name: 'cardId', description: 'Deck card id' }),
      ApiResponse({
        status: 200,
        description: 'Card updated successfully',
        schema: {
          example: {
            id: 'card_1',
            term: '你好',
            meaning: { en: 'hello', vi: 'xin chao' },
            notes: 'Greeting used in daily conversation',
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Validation error',
        schema: {
          oneOf: [
            {
              example: {
                message: ['meaning must be an object'],
                error: 'Bad Request',
                statusCode: 400,
              },
            },
            {
              example: {
                message: ['audioUrl must be a string'],
                error: 'Bad Request',
                statusCode: 400,
              },
            },
          ],
        },
      }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 404, description: 'Deck or card not found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static RemoveCardDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'Remove a card from deck',
        description: 'Delete one card from a deck and update deck cardCount.',
      }),
      ApiParam({ name: 'id', description: 'Deck id' }),
      ApiParam({ name: 'cardId', description: 'Deck card id' }),
      ApiResponse({ status: 204, description: 'Card removed successfully' }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 404, description: 'Deck or card not found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static BulkImportDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'Bulk import words by text list',
        description:
          'Import words from plain text list and map them with dictionary entries. Unknown words are returned in notFound.',
      }),
      ApiParam({ name: 'id', description: 'Deck id' }),
      ApiResponse({
        status: 200,
        description: 'Bulk import completed',
        schema: {
          example: {
            added: 12,
            notFound: ['rareTerm1', 'rareTerm2'],
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Validation error',
        schema: {
          oneOf: [
            {
              example: {
                message: ['texts must be an array'],
                error: 'Bad Request',
                statusCode: 400,
              },
            },
            {
              example: {
                message: ['texts must contain at least 1 elements'],
                error: 'Bad Request',
                statusCode: 400,
              },
            },
          ],
        },
      }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 404, description: 'Deck not found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static BulkImportFileDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'Bulk import deck cards from CSV/XLSX file',
        description:
          'Upload CSV/XLS/XLSX file and import rows into deck cards. Expected columns: term, meaning_vi, meaning_en, pronunciation, notes, imageUrl, audioUrl.',
      }),
      ApiParam({ name: 'id', description: 'Deck id' }),
      ApiConsumes('multipart/form-data'),
      ApiBody({
        schema: {
          type: 'object',
          properties: {
            file: { type: 'string', format: 'binary' },
          },
          required: ['file'],
        },
      }),
      ApiResponse({
        status: 201,
        description: 'File imported successfully',
        schema: {
          example: {
            added: 80,
            skipped: 5,
            total: 85,
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Invalid file or validation error',
        schema: {
          oneOf: [
            {
              example: {
                message: 'Only .csv, .xlsx and .xls files are allowed',
                error: 'Bad Request',
                statusCode: 400,
              },
            },
            {
              example: {
                message:
                  'Failed to parse file – make sure it follows the sample template',
                error: 'Bad Request',
                statusCode: 400,
              },
            },
          ],
        },
      }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 404, description: 'Deck not found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }
}
