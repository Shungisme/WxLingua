import {
  IsNumber,
  Min,
  Max,
  IsString,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudySessionDto {
  @ApiPropertyOptional({ description: 'Word ID (for vocabulary-based review)' })
  @IsString()
  @IsOptional()
  wordId?: string;

  @ApiPropertyOptional({ description: 'DeckCard ID (for deck-based review)' })
  @IsString()
  @IsOptional()
  cardId?: string;

  @ApiProperty({
    description: 'Rating: 1=Again, 2=Hard, 3=Good, 4=Easy',
    enum: [1, 2, 3, 4],
  })
  @IsNumber()
  @Min(1)
  @Max(4)
  rating: number; // 1=Again 2=Hard 3=Good 4=Easy

  @ApiProperty({ description: 'Time spent reviewing in milliseconds' })
  @IsNumber()
  timeSpent: number;
}
