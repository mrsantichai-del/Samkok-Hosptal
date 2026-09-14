import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class AuditQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  tableName?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: AuditQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.action && query.action !== 'ALL') {
      where.action = { contains: query.action, mode: 'insensitive' };
    }

    if (query.tableName && query.tableName !== 'ALL') {
      where.tableName = { contains: query.tableName, mode: 'insensitive' };
    }

    if (query.userId && query.userId !== 'ALL') {
      where.userId = query.userId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { action: { contains: s, mode: 'insensitive' } },
        { tableName: { contains: s, mode: 'insensitive' } },
        { recordId: { contains: s, mode: 'insensitive' } },
        { reason: { contains: s, mode: 'insensitive' } },
        { ipAddress: { contains: s, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { username: { contains: s, mode: 'insensitive' } },
              { employee: { firstName: { contains: s, mode: 'insensitive' } } },
              { employee: { lastName: { contains: s, mode: 'insensitive' } } },
              { employee: { employeeCode: { contains: s, mode: 'insensitive' } } }
            ]
          }
        }
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.client.auditLog.count({ where }),
      this.prisma.client.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              imgUrl: true,
              roles: {
                include: { role: true }
              },
              employee: {
                select: {
                  id: true,
                  employeeCode: true,
                  firstName: true,
                  lastName: true,
                  position: true,
                  department: true
                }
              }
            }
          }
        }
      })
    ]);

    return {
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalLogs, todayLogs, printLogs, approveLogs, activeUsers] = await Promise.all([
      this.prisma.client.auditLog.count(),
      this.prisma.client.auditLog.count({
        where: { createdAt: { gte: today } }
      }),
      this.prisma.client.auditLog.count({
        where: { action: { contains: 'PRINT', mode: 'insensitive' } }
      }),
      this.prisma.client.auditLog.count({
        where: { action: { contains: 'APPROVE', mode: 'insensitive' } }
      }),
      this.prisma.client.auditLog.groupBy({
        by: ['userId'],
        where: { userId: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5
      })
    ]);

    return {
      totalLogs,
      todayLogs,
      printLogs,
      approveLogs,
      topActiveUsersCount: activeUsers.length
    };
  }

  async logEvent(data: {
    userId?: string;
    action: string;
    tableName: string;
    recordId?: string;
    oldData?: any;
    newData?: any;
    reason?: string;
    ipAddress?: string;
  }) {
    return this.prisma.client.auditLog.create({
      data: {
        userId: data.userId || null,
        action: data.action,
        tableName: data.tableName,
        recordId: data.recordId || 'N/A',
        oldData: data.oldData ? JSON.parse(JSON.stringify(data.oldData)) : undefined,
        newData: data.newData ? JSON.parse(JSON.stringify(data.newData)) : undefined,
        reason: data.reason || null,
        ipAddress: data.ipAddress || null
      }
    });
  }
}
