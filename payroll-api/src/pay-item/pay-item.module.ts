import { Module } from '@nestjs/common';
import { PayItemService } from './pay-item.service';
import { PayItemController } from './pay-item.controller';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PayItemController],
  providers: [PayItemService],
})
export class PayItemModule {}
