import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RadicalsModule } from './radicals/radicals.module';
import { WordsModule } from './words/words.module';
import { StudyModule } from './study/study.module';
import { DecksModule } from './decks/decks.module';
import { DictionaryModule } from './dictionary/dictionary.module';
import { LoggerModule } from './common/logger/logger.module';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { ChatModule } from './chat/chat.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    PrismaModule,
    AuthModule,
    RadicalsModule,
    WordsModule,
    StudyModule,
    DecksModule,
    DictionaryModule,
    ChatModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
  ],
})
export class AppModule {}
