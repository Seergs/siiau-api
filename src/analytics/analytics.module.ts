import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Analytic } from '../model/analytic.model';

@Module({
  providers: [AnalyticsService],
  exports: [AnalyticsService],
  controllers: [AnalyticsController],
  imports: [SequelizeModule.forFeature([Analytic])],
})
export class AnalyticsModule {}
