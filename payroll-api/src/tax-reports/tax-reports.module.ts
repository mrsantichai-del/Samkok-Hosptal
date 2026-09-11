import { Module } from '@nestjs/common';
import { TaxReportsService } from './tax-reports.service';
import { TaxReportsController } from './tax-reports.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [PrismaModule, SettingsModule],
  controllers: [TaxReportsController],
  providers: [TaxReportsService],
  exports: [TaxReportsService],
})
export class TaxReportsModule {}
