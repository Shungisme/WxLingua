import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RadicalsModule } from './modules/radicals/radicals.module';
import { WordsModule } from './modules/words/words.module';
import { StudyModule } from './modules/study/study.module';
import { DecksModule } from './modules/decks/decks.module';
import { DictionaryModule } from './modules/dictionary/dictionary.module';
import { LoggerModule } from './modules/logger/logger.module';
import { HttpLoggingInterceptor } from './core/interceptors/http-logging.interceptor';
import { ChatModule } from './modules/chat/chat.module';
import { UsersModule } from './modules/users/users.module';
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
    UsersModule,
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
