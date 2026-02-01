import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RadicalsModule } from './radicals/radicals.module';
import { WordsModule } from './words/words.module';
import { StudyModule } from './study/study.module';
import { DecksModule } from './decks/decks.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    RadicalsModule,
    WordsModule,
    StudyModule,
    DecksModule,
    UploadModule,
  ],
})
export class AppModule {}
