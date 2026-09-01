const fs = require('fs');
const file = 'src/employee/employee.service.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'employeeCode,\n        ...createEmployeeDto,',
  '...createEmployeeDto,\n        employeeCode,'
).replace(
  'employeeCode,\r\n        ...createEmployeeDto,',
  '...createEmployeeDto,\r\n        employeeCode,'
);

fs.writeFileSync(file, content);
console.log('Fixed');
