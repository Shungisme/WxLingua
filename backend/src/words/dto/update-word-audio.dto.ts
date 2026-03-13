import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateWordAudioDto {
  @ApiProperty({
    example: 'https://your-bucket.s3.amazonaws.com/audio/xue.mp3',
    description: 'Public audio URL from S3-compatible storage',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_protocol: true })
  audioUrl: string;
}
