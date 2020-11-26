import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { join } from 'path';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    validationError: { target: false, value: false },
  }));

  app.use(bodyParser.json({ limit: config.limit }));
  app.use(bodyParser.urlencoded({ limit: config.limit, extended: false }));
  app.enableCors();

  app.useStaticAssets(join(__dirname, '..', 'views/front'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  const options = new DocumentBuilder()
    .setTitle('MA15 Mtaji')
    .setDescription('The MA15 Mtaji API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT || 4000);
}

bootstrap();
