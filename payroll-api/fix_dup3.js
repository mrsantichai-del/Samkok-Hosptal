const fs = require('fs');
const file = 'src/payroll/payroll.controller.ts';
let lines = fs.readFileSync(file, 'utf8').split('\\n');

let foundFirst = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('approvePayrollLegacy(')) {
    if (!foundFirst) {
      foundFirst = true;
    } else {
      lines[i] = lines[i].replace('approvePayrollLegacy', 'approvePayrollExec');
    }
  }
}

fs.writeFileSync(file, lines.join('\\n'));
console.log('Fixed duplicates');
