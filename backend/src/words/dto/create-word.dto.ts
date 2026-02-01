import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, IsUrl, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWordDto {
  @ApiProperty({ example: 'zh-TW' })
  @IsString()
  @IsNotEmpty()
  languageCode: string;

  @ApiProperty({ example: '學' })
  @IsString()
  @IsNotEmpty()
  word: string;

  @ApiProperty({ example: 'A2', required: false })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiProperty({ example: { pinyin: 'xué' } })
  @IsOptional()
  metadata?: any;

  @ApiProperty({ example: ['radical_id_1', 'radical_id_2'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  radicalIds?: string[];
  
  @ApiProperty({ example: '/audio/zh/xue.mp3', required: false })
  @IsString()
  @IsOptional()
  audioUrl?: string;
}
