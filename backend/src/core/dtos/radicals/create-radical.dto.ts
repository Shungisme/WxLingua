import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRadicalDto {
  @ApiProperty({ example: '氵' })
  @IsString()
  @IsNotEmpty()
  char: string;

  @ApiProperty({ example: 'chung' })
  @IsString()
  variant: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  strokeCount: number;

  @ApiProperty({ example: { vi: 'nước', en: 'water' } })
  @IsNotEmpty()
  meaning: any;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  frequency: number;
}
