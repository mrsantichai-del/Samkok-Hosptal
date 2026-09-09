const fs = require('fs');
let file = 'src/payroll/payroll.service.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "e.employee.position?.name || 'ไม่ระบุ',",
  "(e.employee.position && typeof e.employee.position === 'object' ? e.employee.position.name : e.employee.position) || 'ไม่ระบุ',"
);

content = content.replace(
  "e.employee.employeeType?.name || 'ไม่ระบุ',",
  "(e.employee.employeeType && typeof e.employee.employeeType === 'object' ? e.employee.employeeType.name : e.employee.employeeType) || 'ไม่ระบุ',"
);

fs.writeFileSync(file, content);
console.log('Fixed object object bug');
