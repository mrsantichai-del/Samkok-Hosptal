const fs = require('fs');
const file = 'prisma/schema.prisma';
let content = fs.readFileSync(file, 'utf8');

// Update Position model
if (!content.includes('departmentId String?')) {
  content = content.replace(
    '  employees   Employee[]\n}',
    '  employees   Employee[]\n  departmentId String?\n  department   Department? @relation(fields: [departmentId], references: [id])\n}'
  );
}

// Update Department model
if (!content.includes('positions Position[]')) {
  content = content.replace(
    '  employees   Employee[]\n}',
    '  employees   Employee[]\n  positions    Position[]\n}'
  );
}

fs.writeFileSync(file, content);
console.log('Schema updated successfully');
