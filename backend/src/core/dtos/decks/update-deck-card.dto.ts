import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDeckCardDto {
  @ApiPropertyOptional({ description: 'The term / word text' })
  @IsString()
  @IsOptional()
  term?: string;

  @ApiPropertyOptional({
    description: 'Meaning object e.g. {"vi": "...", "en": "..."}',
  })
  @IsObject()
  @IsOptional()
  meaning?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Phonetic / pinyin pronunciation' })
  @IsString()
  @IsOptional()
  pronunciation?: string;

  @ApiPropertyOptional({ description: 'Custom image URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Custom audio URL' })
  @IsString()
  @IsOptional()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Personal notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
