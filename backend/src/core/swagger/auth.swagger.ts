import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export class AuthSwagger {
  static RegisterDecorators() {
    return applyDecorators(
      ApiOperation({
        summary: 'Register a new user',
        description: 'Create user account and immediately return access token.',
      }),
      ApiResponse({
        status: 201,
        description: 'User registered successfully',
        schema: {
          example: {
            access_token: 'jwt-token',
            user: {
              id: 'user_123',
              email: 'user@example.com',
              name: 'Alice',
              role: 'USER',
            },
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
                message: ['email must be an email'],
                error: 'Bad Request',
                statusCode: 400,
              },
            },
            {
              example: {
                message: [
                  'password must be longer than or equal to 6 characters',
                ],
                error: 'Bad Request',
                statusCode: 400,
              },
            },
          ],
        },
      }),
      ApiResponse({
        status: 409,
        description: 'Email already exists',
        schema: {
          example: {
            message: 'Email already exists',
            error: 'Conflict',
            statusCode: 409,
          },
        },
      }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static LoginDecorators() {
    return applyDecorators(
      ApiOperation({
        summary: 'Login with email and password',
        description:
          'Authenticate by credentials and return access token + user profile.',
      }),
      ApiResponse({
        status: 200,
        description: 'Login successfully',
        schema: {
          example: {
            access_token: 'jwt-token',
            user: {
              id: 'user_123',
              email: 'user@example.com',
              name: 'Alice',
              role: 'USER',
            },
          },
        },
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({
        status: 401,
        description: 'Invalid credentials',
        schema: {
          example: {
            message: 'Invalid credentials',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static GetProfileDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'Get current user profile',
        description:
          'Return profile information from authenticated JWT context.',
      }),
      ApiResponse({
        status: 200,
        description: 'Profile retrieved successfully',
        schema: {
          example: {
            id: 'user_123',
            email: 'user@example.com',
            name: 'Alice',
            role: 'USER',
            avatar: null,
          },
        },
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static UpdateProfileDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'Update user profile',
        description:
          'Update editable profile fields such as name and avatar URL.',
      }),
      ApiResponse({
        status: 200,
        description: 'Profile updated successfully',
        schema: {
          example: {
            id: 'user_123',
            email: 'user@example.com',
            name: 'Alice Updated',
            role: 'USER',
            avatar: 'https://cdn.example.com/avatar.png',
          },
        },
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 403, description: 'Forbidden' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static ChangePasswordDecorators() {
    return applyDecorators(
      ApiBearerAuth('access_token'),
      ApiOperation({
        summary: 'Change current password',
        description:
          'Change password using currentPassword and newPassword. Current password must match existing password.',
      }),
      ApiResponse({
        status: 200,
        description: 'Password changed successfully',
        schema: { example: { message: 'Password changed successfully' } },
      }),
      ApiResponse({
        status: 400,
        description: 'Validation or password error',
        schema: {
          oneOf: [
            {
              example: {
                message: 'Current password is incorrect',
                error: 'Bad Request',
                statusCode: 400,
              },
            },
            {
              example: {
                message: [
                  'newPassword must be longer than or equal to 6 characters',
                ],
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

  static ForgotPasswordDecorators() {
    return applyDecorators(
      ApiOperation({
        summary: 'Request password reset code',
        description:
          'Send reset code by email if account exists. Always returns success-style response for security.',
      }),
      ApiResponse({
        status: 200,
        description: 'Reset code sent successfully',
        schema: {
          example: {
            message: 'If email exists, verification code has been sent',
          },
        },
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }

  static ResetPasswordDecorators() {
    return applyDecorators(
      ApiOperation({
        summary: 'Reset password with verification code',
        description:
          'Reset account password with 6-digit verification code sent to email.',
      }),
      ApiResponse({
        status: 200,
        description: 'Password reset successfully',
        schema: {
          example: { message: 'Password has been reset successfully' },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Validation or code error',
        schema: {
          oneOf: [
            {
              example: {
                message: 'Verification code is invalid or expired',
                error: 'Bad Request',
                statusCode: 400,
              },
            },
            {
              example: {
                message: [
                  'newPassword must be longer than or equal to 6 characters',
                ],
                error: 'Bad Request',
                statusCode: 400,
              },
            },
          ],
        },
      }),
      ApiResponse({ status: 500, description: 'Internal server error' }),
    );
  }
}
