const fs = require('fs');
let file = 'src/employee/employee.service.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/take: take \? Number\(take\) : 50/, 'take: take ? Number(take) : 10000');
fs.writeFileSync(file, content);
console.log('Updated employee.service.ts API default take to 10000');
