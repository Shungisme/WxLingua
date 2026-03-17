import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'User name',
    example: 'Nguyễn Văn A',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'oldPassword123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Current password cannot be empty' })
  @IsString()
  @MinLength(6, {
    message: 'Current password must be at least 6 characters long',
  })
  currentPassword: string;

  @ApiProperty({
    description: 'New password',
    example: 'newPassword123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'New password cannot be empty' })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Verification code',
    example: '123456',
  })
  @IsNotEmpty({ message: 'Verification code cannot be empty' })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'New password',
    example: 'newPassword123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'New password cannot be empty' })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;
}
