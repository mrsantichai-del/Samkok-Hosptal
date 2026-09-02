const fs = require('fs');
const file = 'src/employee/employee.service.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace globally because there are multiple queries (findOne, getTypes, etc. maybe)
content = content.replace(/employeeType: true,/g, 'employeeType: true,\n        user: true,');

fs.writeFileSync(file, content);
console.log('Added user relation globally');
