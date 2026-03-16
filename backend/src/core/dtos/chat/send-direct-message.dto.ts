import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendDirectMessageDto {
  @ApiProperty({
    description: 'Direct message content',
    example: 'Hey, want to review radicals together tonight?',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content: string;
}
