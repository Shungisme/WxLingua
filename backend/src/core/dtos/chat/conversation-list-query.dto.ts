import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ChatPaginationDto } from './chat-pagination.dto';

export class ConversationListQueryDto extends ChatPaginationDto {
  @ApiPropertyOptional({
    description: 'Search by conversation name or participant name/email',
    example: 'hsk team',
  })
  @IsOptional()
  @IsString()
  q?: string;
}
