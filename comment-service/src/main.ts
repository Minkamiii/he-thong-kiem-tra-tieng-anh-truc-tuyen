import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  //Define a way to read env file
  const configService = app.get(ConfigService);
  
  //Get app port from env
  const port = configService.get<number>('APP_PORT') || 3000;

  //Enable CORS
  app.enableCors();

  //Listen
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);

}
bootstrap();