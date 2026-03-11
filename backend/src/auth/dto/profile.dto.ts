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
    description: 'Tên người dùng',
    example: 'Nguyễn Văn A',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'URL avatar của người dùng',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Mật khẩu hiện tại',
    example: 'oldPassword123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu hiện tại phải có ít nhất 6 ký tự' })
  currentPassword: string;

  @ApiProperty({
    description: 'Mật khẩu mới',
    example: 'newPassword123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email đăng ký tài khoản',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Mã xác thực 6 chữ số',
    example: '123456',
  })
  @IsNotEmpty({ message: 'Mã xác thực không được để trống' })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Mật khẩu mới',
    example: 'newPassword123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;
}
