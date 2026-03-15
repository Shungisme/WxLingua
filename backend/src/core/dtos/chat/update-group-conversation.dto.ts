import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGroupConversationDto {
  @ApiPropertyOptional({
    description: 'New group name',
    example: 'Advanced HSK Group',
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional({
    description: 'New group avatar URL',
    example: 'https://example.com/new-group-avatar.png',
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}
