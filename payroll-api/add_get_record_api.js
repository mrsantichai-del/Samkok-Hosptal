const fs = require('fs');
let file = 'src/payroll/payroll.controller.ts';
let content = fs.readFileSync(file, 'utf8');

const getRecord = `
  @Roles('System Administrator', 'Finance Officer', 'Executive')
  @Get('records/:id')
  @ApiOperation({ summary: 'Get a single payroll record by ID' })
  getRecordById(@Param('id') id: string) {
    return this.payrollService.getPayrollRecordById(id);
  }
`;

content = content.replace(
  "  @Roles('System Administrator', 'Finance Officer', 'Executive')\n  @Get('records/:id/transactions')",
  getRecord + "\n  @Roles('System Administrator', 'Finance Officer', 'Executive')\n  @Get('records/:id/transactions')"
);

fs.writeFileSync(file, content);

let sfile = 'src/payroll/payroll.service.ts';
let scontent = fs.readFileSync(sfile, 'utf8');

const sGetRecord = `
  async getPayrollRecordById(id: string) {
    const record = await this.prisma.payrollRecord.findUnique({
      where: { id }
    });
    if (!record) throw new NotFoundException('Record not found');
    return record;
  }
`;

scontent = scontent.replace(
  "async getPayrollTransactions(recordId: string, employeeId?: string) {",
  sGetRecord + "\n\n  async getPayrollTransactions(recordId: string, employeeId?: string) {"
);

fs.writeFileSync(sfile, scontent);
console.log('Added getPayrollRecordById API');
