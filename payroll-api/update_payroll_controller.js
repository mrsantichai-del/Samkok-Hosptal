const fs = require('fs');
let file = 'src/payroll/payroll.controller.ts';
let content = fs.readFileSync(file, 'utf8');

const newEndpoints = `
  @Patch(':id/request-approval')
  @ApiOperation({ summary: 'Request approval for a payroll record' })
  requestApproval(@Param('id') id: string, @Req() req: any) {
    return this.payrollService.requestApproval(id, req.user.userId);
  }

  @Roles('System Administrator', 'Executive')
  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a payroll record' })
  approvePayroll(@Param('id') id: string, @Req() req: any) {
    return this.payrollService.approvePayroll(id, req.user.userId);
  }

  @Patch(':id/request-edit')
  @ApiOperation({ summary: 'Request edit for an approved payroll record' })
  requestEdit(@Param('id') id: string, @Body('reason') reason: string, @Req() req: any) {
    if (!reason) throw new BadRequestException('Reason is required');
    return this.payrollService.requestEdit(id, req.user.userId, reason);
  }

  @Roles('System Administrator', 'Executive')
  @Patch(':id/grant-edit')
  @ApiOperation({ summary: 'Grant edit access for a payroll record' })
  grantEdit(@Param('id') id: string, @Req() req: any) {
    return this.payrollService.grantEdit(id, req.user.userId);
  }
`;

content = content.replace(
  /  @Roles\('System Administrator', 'Finance Officer', 'Executive'\)\n  @Patch\(':id\/approve'\)\n  @ApiOperation\(\{ summary: 'Approve a payroll record' \}\)\n  approvePayrollLegacy\(@Param\('id'\) id: string, @Req\(\) req: any\) \{\n    return this.payrollService.approvePayroll\(id, req.user.userId\);\n  \}/,
  newEndpoints
);

fs.writeFileSync(file, content);
console.log('Updated payroll.controller.ts');
