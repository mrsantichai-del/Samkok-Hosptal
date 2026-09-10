const fs = require('fs');
let file = 'src/payroll/payroll.controller.ts';
let content = fs.readFileSync(file, 'utf8');

const logEndpoint = `
  @Roles('System Administrator', 'Finance Officer', 'Executive')
  @Get('records/:id/audit-logs')
  @ApiOperation({ summary: 'Get audit logs for a payroll record' })
  getAuditLogs(@Param('id') id: string) {
    return this.payrollService.getAuditLogs(id);
  }
`;

content = content.replace(
  "  @Roles('System Administrator', 'Finance Officer', 'Executive')\n  @Get('records/:id/transactions')",
  logEndpoint + "\n  @Roles('System Administrator', 'Finance Officer', 'Executive')\n  @Get('records/:id/transactions')"
);
fs.writeFileSync(file, content);

let sfile = 'src/payroll/payroll.service.ts';
let scontent = fs.readFileSync(sfile, 'utf8');

const sLogEndpoint = `
  async getAuditLogs(recordId: string) {
    return this.prisma.auditLog.findMany({
      where: { recordId, tableName: 'PayrollRecord' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, username: true } } }
    });
  }
`;

// Wait, the AuditLog table doesn't have a direct relation to User? Let's check schema again. Yes it does! `user User? @relation...`
scontent = scontent.replace(
  "async getPayrollTransactions(recordId: string, employeeId?: string) {",
  sLogEndpoint + "\n\n  async getPayrollTransactions(recordId: string, employeeId?: string) {"
);
fs.writeFileSync(sfile, scontent);

console.log('Added audit-logs API');
