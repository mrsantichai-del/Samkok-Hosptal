import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  private getTargetFilter(user: { userId: string; roles?: string[] }) {
    const roles = Array.isArray(user.roles) ? user.roles : user.roles ? [user.roles] : [];
    
    const orConditions: any[] = [
      { userId: user.userId },
      { userId: null, roleName: null },
      { roleName: 'ALL' },
    ];

    if (roles.length > 0) {
      orConditions.push({ roleName: { in: roles } });
    }

    if (roles.includes('Admin')) {
      return {}; // Admins can see all system notifications
    }

    return { OR: orConditions };
  }

  async getNotifications(user: { userId: string; roles?: string[] }, limit = 30) {
    const filter = this.getTargetFilter(user);
    return this.prisma.notification.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUnreadCount(user: { userId: string; roles?: string[] }) {
    const filter = this.getTargetFilter(user);
    return this.prisma.notification.count({
      where: {
        ...filter,
        isRead: false,
      },
    });
  }

  async markAsRead(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(user: { userId: string; roles?: string[] }) {
    const filter = this.getTargetFilter(user);
    return this.prisma.notification.updateMany({
      where: {
        ...filter,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async createNotification(data: {
    userId?: string;
    roleName?: string;
    title: string;
    message: string;
    linkUrl?: string;
  }) {
    return this.prisma.notification.create({
      data,
    });
  }
}
