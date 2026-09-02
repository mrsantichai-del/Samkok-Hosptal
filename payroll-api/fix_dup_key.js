const fs = require('fs');
const file = 'src/employee/employee.service.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'user: true,\n        user: true,',
  'user: true,'
);

fs.writeFileSync(file, content);
console.log('Fixed duplicate key');
