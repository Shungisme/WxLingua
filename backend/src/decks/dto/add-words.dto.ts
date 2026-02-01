import { IsArray, IsString } from 'class-validator';

export class AddWordsToDeckDto {
  @IsArray()
  @IsString({ each: true })
  wordIds: string[];
}
