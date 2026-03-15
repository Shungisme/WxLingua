import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatGateway } from './controllers/chat.gateway';
import { DirectMessagesController } from './controllers/direct-messages.controller';
import { WsJwtGuard } from './services/ws-jwt.guard';
import { DirectMessagesService } from './services/direct-messages.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [DirectMessagesController],
  providers: [ChatGateway, WsJwtGuard, DirectMessagesService],
})
export class ChatModule {}
