const fs = require('fs');
const file = 'prisma/schema.prisma';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('baseSalary')) {
  content = content.replace(
    /bankName\s+String\?/,
    'bankName     String?\n  baseSalary   Decimal?   @db.Decimal(12, 2)'
  );
  fs.writeFileSync(file, content);
  console.log('Added baseSalary to Employee model.');
} else {
  console.log('baseSalary already exists.');
}
