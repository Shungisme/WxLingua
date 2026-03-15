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

export class WordsSwagger {
  static CreateDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'Create a new word',
        description:
          'Create dictionary word with metadata and optional related radicals.',
      }),
      ApiResponse({
        status: 201,
        description: 'Word created successfully',
        schema: {
          example: {
            id: 'word_123',
            languageCode: 'zh-TW',
            word: '你好',
            level: 'A1',
            metadata: { pinyin: 'ni hao', meanings: ['hello'] },
            wordRadicals: [],
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
                message: ['word should not be empty'],
                error: 'Bad Request',
                statusCode: 400,
              },
            },
            {
              example: {
                message: ['languageCode should not be empty'],
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
        summary: 'List words with filters',
        description:
          'List words with optional language, level, query keyword, limit and cursor pagination.',
      }),
      ApiQuery({
        name: 'language',
        required: false,
        description: 'Language code filter',
      }),
      ApiQuery({ name: 'level', required: false, description: 'Level filter' }),
      ApiQuery({ name: 'q', required: false, description: 'Search keyword' }),
      ApiQuery({
        name: 'limit',
        required: false,
        description: 'Number of records to return',
      }),
      ApiQuery({
        name: 'cursorId',
        required: false,
        description: 'Cursor id for pagination',
      }),
      ApiResponse({
        status: 200,
        description: 'Words retrieved successfully',
        schema: {
          example: [
            {
              id: 'word_123',
              languageCode: 'zh-TW',
              word: '你好',
              level: 'A1',
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

  static FindOneDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'Get word details by id',
        description: 'Return word detail including linked radicals.',
      }),
      ApiParam({ name: 'id', description: 'Word id' }),
      ApiResponse({
        status: 200,
        description: 'Word retrieved successfully',
        schema: {
          example: {
            id: 'word_123',
            word: '你好',
            metadata: { pinyin: 'ni hao' },
            wordRadicals: [
              { position: 0, radical: { id: 'rad_1', char: '亻' } },
            ],
          },
        },
      }),
      ApiResponse({ status: 404, description: 'Word not found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static UpdateAudioUrlDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'Update audio url of a word',
        description:
          'Set or replace audio URL and cleanup old object if needed.',
      }),
      ApiParam({ name: 'id', description: 'Word id' }),
      ApiResponse({
        status: 200,
        description: 'Word audio updated successfully',
        schema: {
          example: {
            id: 'word_123',
            audioUrl: 'https://cdn.example.com/audio/word.mp3',
          },
        },
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 404, description: 'Word not found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static UploadAudioDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({ summary: 'Upload audio file and bind to a word' }),
      ApiParam({ name: 'id', description: 'Word id' }),
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
      ApiResponse({ status: 201, description: 'Audio uploaded successfully' }),
      ApiResponse({
        status: 400,
        description: 'Invalid file or validation error',
      }),
      ApiResponse({ status: 404, description: 'Word not found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static DeleteAudioDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'Delete audio from a word',
        description:
          'Delete current audio object and clear audioUrl in database.',
      }),
      ApiParam({ name: 'id', description: 'Word id' }),
      ApiResponse({
        status: 200,
        description: 'Audio removed successfully',
        schema: { example: { id: 'word_123', audioUrl: null } },
      }),
      ApiResponse({ status: 404, description: 'Word not found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }
}
