const fs = require('fs');
let file = 'src/payroll/payroll.service.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. We replace the dynamic header logic with one that fetches ALL active PayItems.
const oldExportExcelStart = /async exportExcel\(recordId: string, res: Response, employeeIds\?: string\[\]\) \{[\s\S]*?\/\/ Headers\n      const incArr = Array\.from\(incomeHeaders\);\n      const dedArr = Array\.from\(deductionHeaders\);/g;

const newExportExcelStart = `async exportExcel(recordId: string, res: Response, employeeIds?: string[]) {
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

    // Include ALL active Pay Items to ensure Export matches Import exactly
    const allPayItems = await this.prisma.payItem.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' }
    });
    
    const incArr = allPayItems.filter(p => p.type === 'INCOME').map(p => p.name);
    const dedArr = allPayItems.filter(p => p.type === 'DEDUCTION').map(p => p.name);`;

content = content.replace(oldExportExcelStart, newExportExcelStart);

// Let's also make sure we only write scalar values to Excel to avoid [object Object]
content = content.replace(
  '           e.employee.position?.name || \'ไม่ระบุ\',',
  '           e.employee.position && typeof e.employee.position.name === \'string\' ? e.employee.position.name : \'ไม่ระบุ\','
);

content = content.replace(
  '           e.employee.employeeType?.name || \'ไม่ระบุ\',',
  '           e.employee.employeeType && typeof e.employee.employeeType.name === \'string\' ? e.employee.employeeType.name : \'ไม่ระบุ\','
);

fs.writeFileSync(file, content);
console.log('Fixed export excel to include all columns');
