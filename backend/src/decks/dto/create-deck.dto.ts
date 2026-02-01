import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateDeckDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  languageCode?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
