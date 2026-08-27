import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayItemDto } from './dto/create-pay-item.dto';
import { UpdatePayItemDto } from './dto/update-pay-item.dto';

@Injectable()
export class PayItemService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.payItem.findMany({
      where: { deletedAt: null },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.payItem.findFirst({
      where: { id, deletedAt: null },
    });
    if (!item) throw new NotFoundException('Pay item not found');
    return item;
  }

  async create(createPayItemDto: CreatePayItemDto) {
    const existing = await this.prisma.payItem.findUnique({
      where: { name: createPayItemDto.name }
    });
    if (existing) {
      if (existing.deletedAt) {
         // Restore if soft-deleted
         return this.prisma.payItem.update({
           where: { id: existing.id },
           data: { ...createPayItemDto, deletedAt: null }
         });
      }
      throw new BadRequestException('Pay item with this name already exists');
    }

    return this.prisma.payItem.create({
      data: createPayItemDto,
    });
  }

  async update(id: string, updatePayItemDto: UpdatePayItemDto) {
    await this.findOne(id); // ensure exists
    return this.prisma.payItem.update({
      where: { id },
      data: updatePayItemDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id); // ensure exists
    
    const deleted = await this.prisma.payItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'SOFT_DELETE',
        tableName: 'PayItem',
        recordId: id,
        userId: userId,
        reason: 'Deleted by user request via API',
      }
    });

    return { message: 'Pay item deleted successfully' };
  }
}
