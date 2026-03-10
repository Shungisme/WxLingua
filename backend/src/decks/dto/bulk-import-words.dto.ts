import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class BulkImportWordsDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  texts: string[];
}
