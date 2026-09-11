import { Controller, Get, Query, Request, UseGuards, Param, NotFoundException } from '@nestjs/common';
import { TaxReportsService } from './tax-reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tax-reports')
@UseGuards(JwtAuthGuard)
export class TaxReportsController {
  constructor(private readonly taxReportsService: TaxReportsService) {}

  // 1. Employee Self-Service: My Payslips
  @Get('my-payslips')
  async getMyPayslips(
    @Request() req: any,
    @Query('year') year?: number,
    @Query('month') month?: number,
    @Query('round') round?: number,
    @Query('employeeId') employeeId?: string,
  ) {
    const userId = req.user.userId;
    return this.taxReportsService.getMyPayslips(userId, { year, month, round, employeeId });
  }

  // 2. Employee Self-Service: My 50 Tawi
  @Get('my-50-tawi')
  async getMy50Tawi(
    @Request() req: any,
    @Query('year') year?: number,
    @Query('employeeId') employeeId?: string,
  ) {
    const userId = req.user.userId;
    const employee = await this.taxReportsService.resolveEmployee(userId, employeeId);
    if (!employee) {
      throw new NotFoundException('ไม่พบข้อมูลประวัติบุคลากร');
    }
    return this.taxReportsService.get50Tawi(employee.id, year || new Date().getFullYear());
  }

  // 3. HR/Admin: Get 50 Tawi for any specific employee
  @Get('50-tawi/:employeeId')
  async get50TawiByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('year') year?: number,
  ) {
    return this.taxReportsService.get50Tawi(employeeId, year || new Date().getFullYear());
  }
}
