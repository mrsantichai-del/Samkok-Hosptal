const fs = require('fs');
let content = fs.readFileSync('src/payroll/payroll.service.ts', 'utf8');

content = content.replace(
  /let transactions = await this\.getPayrollTransactions\(recordId\);\\n      if \(employeeIds && employeeIds\.length > 0\) \{\\n        transactions = transactions\.filter\(tx => employeeIds\.includes\(tx\.employeeId\)\);\\n        transactions\.sort\(\(a, b\) => employeeIds\.indexOf\(a\.employeeId\) - employeeIds\.indexOf\(b\.employeeId\)\);\\n      \}/,
  `let transactions = await this.getPayrollTransactions(recordId);
      if (employeeIds && employeeIds.length > 0) {
        transactions = transactions.filter(tx => employeeIds.includes(tx.employeeId));
        transactions.sort((a, b) => employeeIds.indexOf(a.employeeId) - employeeIds.indexOf(b.employeeId));
      }`
);

fs.writeFileSync('src/payroll/payroll.service.ts', content);
