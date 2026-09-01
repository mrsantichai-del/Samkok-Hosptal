const fs = require('fs');
const file = 'src/payroll/payroll.controller.ts';
let content = fs.readFileSync(file, 'utf8');

const snippet = `  @Roles('System Administrator', 'Finance Officer', 'Executive')
  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a payroll record' })
  approvePayroll(@Param('id') id: string, @Req() req: any) {
    return this.payrollService.approvePayroll(id, req.user.userId);
  }`;

content = content.replace(snippet, '');
fs.writeFileSync(file, content);
console.log('Removed duplicate method');
