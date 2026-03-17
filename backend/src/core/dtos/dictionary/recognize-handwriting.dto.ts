import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class HandwritingStrokeDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  x: number[];

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  y: number[];

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  t: number[];
}

export class RecognizeHandwritingDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => HandwritingStrokeDto)
  strokes: HandwritingStrokeDto[];

  @IsOptional()
  @IsString()
  @IsIn(['zh-TW', 'zh-CN'])
  language?: 'zh-TW' | 'zh-CN' = 'zh-TW';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  maxCandidates?: number = 5;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(64)
  @Max(1024)
  width?: number = 320;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(64)
  @Max(1024)
  height?: number = 320;
}
