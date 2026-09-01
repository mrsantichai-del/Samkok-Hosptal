const fs = require('fs');
const file = 'src/payroll/payroll.service.ts';
let content = fs.readFileSync(file, 'utf8');

// Update exportExcel signature and logic
content = content.replace(
  'async exportExcel(recordId: string, res: Response) {',
  'async exportExcel(recordId: string, res: Response, employeeIds?: string[]) {'
);

const excelFilterLogic = `
    if (employeeIds && employeeIds.length > 0) {
      transactions = transactions.filter(tx => employeeIds.includes(tx.employeeId));
      transactions.sort((a, b) => employeeIds.indexOf(a.employeeId) - employeeIds.indexOf(b.employeeId));
    }`;

content = content.replace(
  'const transactions = await this.getPayrollTransactions(recordId);',
  'let transactions = await this.getPayrollTransactions(recordId);' + excelFilterLogic
);


// Update exportPdf signature and logic
content = content.replace(
  'async exportPdf(recordId: string, res: Response) {',
  'async exportPdf(recordId: string, res: Response, employeeIds?: string[]) {'
);

const pdfFilterLogic = `
      if (employeeIds && employeeIds.length > 0) {
        // EmpData Map values iteration order is insertion order!
        // We need to re-sort transactions so the Map insertion order matches employeeIds!
        transactions = transactions.filter(tx => employeeIds.includes(tx.employeeId));
        transactions.sort((a, b) => employeeIds.indexOf(a.employeeId) - employeeIds.indexOf(b.employeeId));
      }`;

content = content.replace(
  '      const transactions = await this.getPayrollTransactions(recordId);',
  '      let transactions = await this.getPayrollTransactions(recordId);' + pdfFilterLogic
);

fs.writeFileSync(file, content);
