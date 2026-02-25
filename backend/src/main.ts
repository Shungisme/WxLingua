import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppLogger } from './common/logger/app-logger.service';

async function bootstrap() {
  // Create app with bufferLogs=true so logs are not lost before the logger is ready
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Retrieve the singleton AppLogger and set it as the NestJS framework logger
  const logger = app.get(AppLogger);
  app.useLogger(logger);

  // Best Practice: Security headers
  app.use(helmet());

  app.enableCors();
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('WxLingua API')
    .setDescription('The WxLingua Flashcard Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  logger.log(`Application is running on: ${await app.getUrl()}`, 'Bootstrap');
  logger.log(
    `Swagger Docs available at: ${await app.getUrl()}/api/docs`,
    'Bootstrap',
  );
}
bootstrap();
