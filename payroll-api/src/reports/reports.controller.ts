import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('executive/summary')
  async getExecutiveSummary(@Query() query: any) {
    return this.reportsService.getExecutiveSummary(query);
  }

  @Get('executive/by-dimension')
  async getByDimension(
    @Query('dimension') dimension: 'department' | 'position' | 'employeeType' | 'payCategory' = 'department',
    @Query() query: any
  ) {
    return this.reportsService.getByDimension(dimension, query);
  }

  @Get('executive/trend')
  async getTimelineTrend(@Query() query: any) {
    return this.reportsService.getTimelineTrend(query);
  }

  @Get('executive/drilldown')
  async getDrilldownDetails(@Query() query: any) {
    return this.reportsService.getDrilldownDetails(query);
  }
}
