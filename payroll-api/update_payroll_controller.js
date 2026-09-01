const fs = require('fs');

const file = 'src/payroll/payroll.controller.ts';
let content = fs.readFileSync(file, 'utf8');

const newEndpoint = `
  @Roles('System Administrator', 'Finance Officer', 'Executive')
  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a payroll record' })
  approvePayroll(@Param('id') id: string, @Req() req: any) {
    return this.payrollService.approvePayroll(id, req.user.userId);
  }
`;

content = content.replace(
  'export class PayrollController {',
  'export class PayrollController {\n' + newEndpoint
);

fs.writeFileSync(file, content);
console.log("Updated payroll.controller.ts");
