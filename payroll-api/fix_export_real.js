const fs = require('fs');
let file = 'src/payroll/payroll.service.ts';
let lines = fs.readFileSync(file, 'utf8').split('\n');

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('async exportExcel(recordId: string, res: Response, employeeIds?: string[]) {')) {
    startIdx = i;
  }
  if (startIdx !== -1 && lines[i].includes('const headers = [\'ลำดับที่\', \'รหัสพนักงาน\',')) {
    endIdx = i;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  const newCode = `  async exportExcel(recordId: string, res: Response, employeeIds?: string[]) {
    const record = await this.prisma.payrollRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Record not found');

    let transactions = await this.getPayrollTransactions(recordId);
    if (employeeIds && employeeIds.length > 0) {
      transactions = transactions.filter(tx => employeeIds.includes(tx.employeeId));
      transactions.sort((a, b) => employeeIds.indexOf(a.employeeId) - employeeIds.indexOf(b.employeeId));
    }
    
    // Group by Employee
    const empData = new Map<string, any>();

    for (const tx of transactions) {
      if (!tx.employee || !tx.payItem) continue;

      if (!empData.has(tx.employeeId)) {
        empData.set(tx.employeeId, { employee: tx.employee, incomes: {}, deductions: {}, totalIncome: 0, totalDeduction: 0 });
      }
      const e = empData.get(tx.employeeId);
      const amount = Number(tx.amount) || 0;
      if (tx.payItem.type === 'INCOME') {
         e.incomes[tx.payItem.name] = amount;
         e.totalIncome += amount;
      } else {
         e.deductions[tx.payItem.name] = amount;
         e.totalDeduction += amount;
      }
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(\`Payroll_\${record.month}_\${record.year}\`);

    // Include ALL active Pay Items to ensure Export matches Import exactly
    const allPayItems = await this.prisma.payItem.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' }
    });
    
    const incArr = allPayItems.filter(p => p.type === 'INCOME').map(p => p.name);
    const dedArr = allPayItems.filter(p => p.type === 'DEDUCTION').map(p => p.name);
`;
  lines.splice(startIdx, endIdx - startIdx, newCode);
  fs.writeFileSync(file, lines.join('\n'));
  console.log('Replaced successfully');
} else {
  console.log('Could not find start/end indices', startIdx, endIdx);
}
