import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmployeeModule } from './employee/employee.module';
import { PayItemModule } from './pay-item/pay-item.module';
import { PayrollModule } from './payroll/payroll.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    EmployeeModule, 
    PayItemModule, 
    PayrollModule,
    SettingsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
