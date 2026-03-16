import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class WsSendDirectMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content: string;
}
