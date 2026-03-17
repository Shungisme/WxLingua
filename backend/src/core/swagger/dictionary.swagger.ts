import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

export class DictionarySwagger {
  static SearchDecorators() {
    return applyDecorators(
      ApiOperation({
        summary: 'Search dictionary words',
        description:
          'Search by character, pinyin, meaning or all modes with language and limit.',
      }),
      ApiQuery({ name: 'q', required: true, description: 'Search keyword' }),
      ApiQuery({
        name: 'type',
        required: false,
        schema: {
          type: 'string',
          enum: ['character', 'pinyin', 'meaning', 'all'],
        },
      }),
      ApiQuery({
        name: 'language',
        required: false,
        description: 'Language code, default zh-TW',
      }),
      ApiQuery({
        name: 'limit',
        required: false,
        description: 'Max rows, 1-100',
      }),
      ApiResponse({
        status: 200,
        description: 'Search result retrieved successfully',
        schema: {
          example: {
            words: [
              {
                id: 'word_123',
                word: '你好',
                languageCode: 'zh-TW',
                metadata: { pinyin: 'ni hao', meanings: ['hello'] },
              },
            ],
            total: 1,
            query: 'ni',
            searchType: 'pinyin',
          },
        },
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static GetWordDecorators() {
    return applyDecorators(
      ApiOperation({ summary: 'Get dictionary word by id' }),
      ApiParam({ name: 'id', description: 'Word id' }),
      ApiResponse({ status: 200, description: 'Word retrieved successfully' }),
      ApiResponse({ status: 404, description: 'Word not found' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static GetRadicalDecorators() {
    return applyDecorators(
      ApiOperation({ summary: 'Get radical by character' }),
      ApiParam({ name: 'char', description: 'Radical character' }),
      ApiResponse({
        status: 200,
        description: 'Radical retrieved successfully',
      }),
      ApiResponse({ status: 404, description: 'Radical not found' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static ListRadicalsDecorators() {
    return applyDecorators(
      ApiOperation({ summary: 'List radicals' }),
      ApiQuery({
        name: 'limit',
        required: false,
        description: 'Max radicals to return',
      }),
      ApiResponse({
        status: 200,
        description: 'Radicals retrieved successfully',
        schema: {
          example: [{ id: 'rad_1', char: '氵', strokeCount: 3, frequency: 1 }],
        },
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }
}
