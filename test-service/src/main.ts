import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //App configuration
  //App port
  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT') || 3000;

  //Config global validator pipes
  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,
  //   forbidNonWhitelisted: true,
  //   transform: true,
  // }))

  //OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle("Test service open API")
    .setDescription("APIs and DTOs for test service")
    .setVersion("1.0")
    .build();
  const swaggerOptions: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  }
  const documentFactory = () => SwaggerModule.createDocument(app, config, swaggerOptions);
  SwaggerModule.setup("/openapi/te", app, documentFactory());

  //Static dir
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  //Enable CORS
  app.enableCors();

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
