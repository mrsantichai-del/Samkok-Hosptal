const fs = require('fs');
let file = 'prisma/schema.prisma';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '  approvedPayrolls PayrollRecord[]',
  '  approvedPayrolls PayrollRecord[]\n  notifications    Notification[]'
);

fs.writeFileSync(file, content);
console.log('Added notifications relation to User');
