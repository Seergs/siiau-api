import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { DatabaseModule } from 'src/database/database.module';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';

@Module({
  providers: [CreditsService],
  controllers: [CreditsController],
  imports: [DatabaseModule, PuppeteerModule],
})
export class CreditsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('credits');
  }
}
