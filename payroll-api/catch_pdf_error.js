const fs = require('fs');
const file = 'src/payroll/payroll.controller.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'async exportPdf(@Param(\'id\') id: string, @Res() res: Response) {\n    await this.payrollService.exportPdf(id, res);\n  }',
  `async exportPdf(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.payrollService.exportPdf(id, res);
    } catch (error: any) {
      console.error('PDF Export Error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'PDF Error: ' + (error.message || 'Unknown error'), stack: error.stack });
      }
    }
  }`
);

fs.writeFileSync(file, content);
