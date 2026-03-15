import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateGroupConversationDto {
  @ApiProperty({
    description: 'Display name of the group conversation',
    example: 'HSK Team Study Group',
    maxLength: 80,
  })
  @IsString()
  @MaxLength(80)
  name: string;

  @ApiPropertyOptional({
    description: 'Optional group avatar URL',
    example: 'https://example.com/group-avatar.png',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description:
      'User ids to include in the group (current user will be added automatically)',
    example: ['clxabc111', 'clxabc222'],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  participantIds: string[];
}
