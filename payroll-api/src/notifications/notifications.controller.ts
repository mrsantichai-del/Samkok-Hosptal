import { Controller, Get, Patch, Param, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Req() req: any, @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 30;
    return this.notificationsService.getNotifications(req.user, parsedLimit);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user);
    return { unreadCount: count };
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    await this.notificationsService.markAllAsRead(req.user);
    return { message: 'ทำเครื่องหมายอ่านทั้งหมดแล้ว' };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
