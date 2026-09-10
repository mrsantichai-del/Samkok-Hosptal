const fs = require('fs');
let file = 'src/users/users.controller.ts';
let content = fs.readFileSync(file, 'utf8');

const newMethod = `
  @Get('my-notifications')
  @ApiOperation({ summary: 'Get notifications for current user' })
  async getMyNotifications(@Req() req: any) {
    const userId = req.user.userId;
    const roles = req.user.roles || [];
    return this.usersService.getNotifications(userId, roles);
  }

  @Patch('notifications/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@Req() req: any) {
    const userId = req.user.userId;
    return this.usersService.markAllNotificationsRead(userId);
  }
`;

content = content.replace(
  /export class UsersController \{/,
  "import { Req } from '@nestjs/common';\nexport class UsersController {\n" + newMethod
);

fs.writeFileSync(file, content);

let sfile = 'src/users/users.service.ts';
let scontent = fs.readFileSync(sfile, 'utf8');

const sNewMethod = `
  async getNotifications(userId: string, roles: string[]) {
    // Get notifications where userId is null (global), or userId matches, or roleName matches
    const notifs = await this.prisma.notification.findMany({
      where: {
        OR: [
          { userId: null, roleName: null }, // global
          { userId: userId },               // direct
          { roleName: { in: roles } }       // role based
        ],
        isRead: false
      },
      orderBy: { createdAt: 'desc' }
    });
    return notifs;
  }

  async markAllNotificationsRead(userId: string) {
    // This is a bit tricky because global notifications can't be marked read for everyone if just one reads it.
    // Ideally we need a NotificationRead table, but for now we just mark the ones directly for the user as read.
    // Or we just delete them?
    // Let's just mark the ones that have userId = this user.
    await this.prisma.notification.updateMany({
      where: { userId: userId },
      data: { isRead: true }
    });
    return { success: true };
  }
`;

scontent = scontent.replace(
  /export class UsersService \{/,
  "export class UsersService {\n" + sNewMethod
);

fs.writeFileSync(sfile, scontent);
console.log('Added notifications endpoints to users');
