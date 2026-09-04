const fs = require('fs');
const file = 'src/employee/employee.service.ts';
let content = fs.readFileSync(file, 'utf8');

// Add include to getPositions
content = content.replace(
  /async getPositions\(\) \{\s*return this\.prisma\.position\.findMany\(\{\s*where: \{ deletedAt: null \},\s*orderBy: \{ name: 'asc' \}\s*\}\);\s*\}/,
  `async getPositions() {
    return this.prisma.position.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: { department: true }
    });
  }`
);

// We should also allow creating/updating a position with a departmentId!
// Wait, the createPosition signature is `async createPosition(name: string, description?: string)`
// Update it to `async createPosition(name: string, description?: string, departmentId?: string)`
content = content.replace(
  /async createPosition\(name: string, description\?: string\) \{/,
  'async createPosition(name: string, description?: string, departmentId?: string) {'
);
content = content.replace(
  /return this\.prisma\.position\.create\(\{\s*data: \{ name, description \}\s*\}\);/,
  'return this.prisma.position.create({ data: { name, description, departmentId } });'
);

content = content.replace(
  /async updatePosition\(id: string, name: string, description\?: string\) \{/,
  'async updatePosition(id: string, name: string, description?: string, departmentId?: string) {'
);
content = content.replace(
  /return this\.prisma\.position\.update\(\{\s*where: \{ id \},\s*data: \{ name, description \}\s*\}\);/,
  'return this.prisma.position.update({ where: { id }, data: { name, description, departmentId } });'
);

fs.writeFileSync(file, content);
console.log('Updated employee.service.ts');
