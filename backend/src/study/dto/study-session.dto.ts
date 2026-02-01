import { IsString, IsBoolean, IsNumber } from 'class-validator';

export class StudySessionDto {
  @IsString()
  wordId: string;

  @IsBoolean()
  correct: boolean;

  @IsNumber()
  timeSpent: number; // milliseconds
}
