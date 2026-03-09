import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StudySessionDto {
  @ApiProperty({ description: 'Word ID to review' })
  wordId: string;

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
