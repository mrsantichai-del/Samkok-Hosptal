const fs = require('fs');
const file = 'src/payroll/payroll.controller.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "@Get('records/:id/export/excel')\n  @ApiOperation({ summary: 'Export Payroll to Excel' })\n  async exportExcel(@Param('id') id: string, @Res() res: Response) {\n    await this.payrollService.exportExcel(id, res);\n  }",
  "@Post('records/:id/export/excel')\n  @ApiOperation({ summary: 'Export Payroll to Excel' })\n  async exportExcel(@Param('id') id: string, @Body() body: { employeeIds?: string[] }, @Res() res: Response) {\n    await this.payrollService.exportExcel(id, res, body.employeeIds);\n  }"
);

content = content.replace(
  "  @Get('records/:id/export/pdf')\n  @ApiOperation({ summary: 'Export Payslips to PDF' })\n  async exportPdf(@Param('id') id: string, @Res() res: Response) {\n    try {\n      await this.payrollService.exportPdf(id, res);\n    }",
  "  @Post('records/:id/export/pdf')\n  @ApiOperation({ summary: 'Export Payslips to PDF' })\n  async exportPdf(@Param('id') id: string, @Body() body: { employeeIds?: string[] }, @Res() res: Response) {\n    try {\n      await this.payrollService.exportPdf(id, res, body.employeeIds);\n    }"
);

// We need to import Body and Post if not already imported.
// But wait, Post and Body are usually imported from @nestjs/common.
content = content.replace(
  "import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res } from '@nestjs/common';",
  "import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res } from '@nestjs/common';"
);
// In case they are not in the import list:
if (!content.includes("Body,")) {
  content = content.replace("Get,", "Get, Post, Body,");
}

fs.writeFileSync(file, content);
