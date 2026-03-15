import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StartConversationDto {
  @ApiProperty({
    description: 'User id of the friend to start or open a conversation with',
    example: 'clx0abc123xyz',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
