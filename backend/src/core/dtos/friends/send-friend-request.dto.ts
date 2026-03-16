import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendFriendRequestDto {
  @ApiProperty({
    description: 'Target user id to send a friend request to',
    example: 'clx0abc123xyz',
  })
  @IsString()
  @IsNotEmpty()
  targetUserId: string;
}
