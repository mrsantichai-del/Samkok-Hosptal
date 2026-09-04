const fs = require('fs');
const file = 'prisma/schema.prisma';
let content = fs.readFileSync(file, 'utf8');

// Update Position model
const positionRegex = /model Position \{[\s\S]*?employees\s+Employee\[\]\s*\}/;
if (content.match(positionRegex)) {
  content = content.replace(positionRegex, match => {
    if (match.includes('departmentId')) return match;
    return match.replace(/employees\s+Employee\[\]/, 'employees   Employee[]\n  departmentId String?\n  department   Department? @relation(fields: [departmentId], references: [id])');
  });
}

// Update Department model
const departmentRegex = /model Department \{[\s\S]*?employees\s+Employee\[\]\s*\}/;
if (content.match(departmentRegex)) {
  content = content.replace(departmentRegex, match => {
    if (match.includes('positions')) return match;
    return match.replace(/employees\s+Employee\[\]/, 'employees   Employee[]\n  positions    Position[]');
  });
}

fs.writeFileSync(file, content);
console.log('Schema updated successfully (v2)');
