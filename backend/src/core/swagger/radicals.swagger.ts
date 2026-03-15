import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

export class RadicalsSwagger {
  static CreateDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'Create a new radical',
        description:
          'Create a radical entry with character, stroke count, meaning and optional image.',
      }),
      ApiResponse({
        status: 201,
        description: 'Radical created successfully',
        schema: {
          example: {
            id: 'rad_1',
            char: '氵',
            variant: 'thuy',
            strokeCount: 3,
            meaning: { vi: 'nuoc', en: 'water' },
            frequency: 1,
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
                message: ['char should not be empty'],
                error: 'Bad Request',
                statusCode: 400,
              },
            },
            {
              example: {
                message: ['strokeCount must not be less than 1'],
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
      ApiOperation({ summary: 'List radicals' }),
      ApiQuery({
        name: 'limit',
        required: false,
        description: 'Max number of radicals',
      }),
      ApiResponse({
        status: 200,
        description: 'Radicals retrieved successfully',
        schema: {
          example: [
            { id: 'rad_1', char: '氵', strokeCount: 3, frequency: 1 },
            { id: 'rad_2', char: '木', strokeCount: 4, frequency: 2 },
          ],
        },
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static FindOneDecorators() {
    return applyDecorators(
      ApiOperation({ summary: 'Get radical by id' }),
      ApiParam({ name: 'id', description: 'Radical id' }),
      ApiResponse({
        status: 200,
        description: 'Radical retrieved successfully',
        schema: {
          example: {
            id: 'rad_1',
            char: '氵',
            variant: 'thuy',
            strokeCount: 3,
            meaning: { vi: 'nuoc', en: 'water' },
            frequency: 1,
          },
        },
      }),
      ApiResponse({ status: 404, description: 'Radical not found' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }
}
