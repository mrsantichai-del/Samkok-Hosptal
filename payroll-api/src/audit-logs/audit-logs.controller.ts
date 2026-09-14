import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AuditLogsService, AuditQueryDto } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles('Admin', 'System Administrator', 'Executive')
  findAll(@Query() query: AuditQueryDto) {
    return this.auditLogsService.findAll(query);
  }

  @Get('stats')
  @Roles('Admin', 'System Administrator', 'Executive')
  getStats() {
    return this.auditLogsService.getStats();
  }

  @Post('log-event')
  logEvent(@Body() body: any, @Req() req: any) {
    const user = req.user;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    return this.auditLogsService.logEvent({
      userId: user?.userId || user?.id,
      action: body.action || 'USER_ACTION',
      tableName: body.tableName || 'System',
      recordId: body.recordId || 'N/A',
      oldData: body.oldData,
      newData: body.newData,
      reason: body.reason,
      ipAddress: ip ? String(ip) : undefined
    });
  }
}
