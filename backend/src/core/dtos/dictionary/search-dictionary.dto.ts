import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum SearchType {
  CHARACTER = 'character',
  PINYIN = 'pinyin',
  MEANING = 'meaning',
  ALL = 'all',
}

export class SearchDictionaryDto {
  @IsString()
  q: string; // search query

  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType = SearchType.ALL;

  @IsOptional()
  @IsString()
  language?: string = 'zh-TW';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
