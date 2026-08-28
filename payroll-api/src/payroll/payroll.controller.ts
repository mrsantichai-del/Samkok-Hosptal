import { Controller, Post, Body, Get, Param, Patch, UseGuards, Req, Query, Res } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { ProcessPayrollDto } from './dto/process-payroll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('Payroll Processing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Roles('System Administrator', 'Finance Officer')
  @Post('process')
  @ApiOperation({ summary: 'Process payroll for a given month and year (Draft)' })
  processPayroll(@Body() processPayrollDto: ProcessPayrollDto, @Req() req: any) {
    return this.payrollService.processPayroll(processPayrollDto, req.user.userId);
  }

  @Roles('System Administrator', 'Finance Officer', 'Executive')
  @Get('records')
  @ApiOperation({ summary: 'Get all payroll records (summary)' })
  getRecords() {
    return this.payrollService.getPayrollRecords();
  }

  @Roles('System Administrator', 'Finance Officer', 'Executive')
  @Get('records/:id/transactions')
  @ApiOperation({ summary: 'Get all transactions for a payroll record' })
  @ApiQuery({ name: 'employeeId', required: false })
  getTransactions(@Param('id') id: string, @Query('employeeId') employeeId?: string) {
    return this.payrollService.getPayrollTransactions(id, employeeId);
  }

  @Roles('System Administrator', 'Finance Officer')
  @Patch('records/:id/employee/:empId')
  @ApiOperation({ summary: 'Update transactions for a specific employee in a payroll record' })
  updateEmployeeTransactions(@Param('id') id: string, @Param('empId') empId: string, @Body() body: { transactions: { payItemId: string, amount: number }[] }, @Req() req: any) {
    return this.payrollService.updateEmployeeTransactions(id, empId, body.transactions, req.user.userId);
  }

  @Roles('Executive', 'System Administrator')
  @Patch('records/:id/approve')
  @ApiOperation({ summary: 'Approve a payroll record (Executive only)' })
  approvePayroll(@Param('id') id: string, @Req() req: any) {
    return this.payrollService.approvePayroll(id, req.user.userId);
  }

  @Roles('System Administrator', 'Finance Officer', 'Executive')
  @Get('records/:id/export/excel')
  @ApiOperation({ summary: 'Export Payroll to Excel' })
  async exportExcel(@Param('id') id: string, @Res() res: Response) {
    await this.payrollService.exportExcel(id, res);
  }

  @Roles('System Administrator', 'Finance Officer', 'Executive', 'Employee')
  @Get('records/:id/export/pdf')
  @ApiOperation({ summary: 'Export Payslips to PDF' })
  async exportPdf(@Param('id') id: string, @Res() res: Response) {
    await this.payrollService.exportPdf(id, res);
  }
}
