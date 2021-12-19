import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let initialPort = 3000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  let shouldTryAgain = true;

  while (shouldTryAgain) {
    try {
      await app.listen(initialPort);
      shouldTryAgain = false;
      console.log('listening on ' + initialPort);
    } catch (e) {
      shouldTryAgain = true;
      initialPort++;
    }
  }
}
bootstrap();
