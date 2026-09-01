const fs = require('fs');

const file = 'src/employee/employee.service.ts';
let content = fs.readFileSync(file, 'utf8');

// We also need BadRequestException imported
if (!content.includes('BadRequestException')) {
  content = content.replace('NotFoundException', 'NotFoundException, BadRequestException');
}

// createType
content = content.replace(
  /async createType\(name: string, description\?: string\) \{\s+return this\.prisma\.employeeType\.create\(\{\s+data: \{ name, description \}\s+\}\);\s+\}/,
  `async createType(name: string, description?: string) {
    const existing = await this.prisma.employeeType.findFirst({ where: { name, deletedAt: null } });
    if (existing) throw new BadRequestException('ชื่อประเภทพนักงานนี้มีอยู่ในระบบแล้ว');
    return this.prisma.employeeType.create({
      data: { name, description }
    });
  }`
);

// updateType
content = content.replace(
  /async updateType\(id: string, data: \{ name\?: string; description\?: string \}\) \{\s+return this\.prisma\.employeeType\.update\(\{\s+where: \{ id \},\s+data\s+\}\);\s+\}/,
  `async updateType(id: string, data: { name?: string; description?: string }) {
    if (data.name) {
      const existing = await this.prisma.employeeType.findFirst({ where: { name: data.name, id: { not: id }, deletedAt: null } });
      if (existing) throw new BadRequestException('ชื่อประเภทพนักงานนี้มีอยู่ในระบบแล้ว');
    }
    return this.prisma.employeeType.update({
      where: { id },
      data
    });
  }`
);

// createPosition
content = content.replace(
  /async createPosition\(name: string, description\?: string\) \{\s+return this\.prisma\.position\.create\(\{\s+data: \{ name, description \}\s+\}\);\s+\}/,
  `async createPosition(name: string, description?: string) {
    const existing = await this.prisma.position.findFirst({ where: { name, deletedAt: null } });
    if (existing) throw new BadRequestException('ชื่อตำแหน่งนี้มีอยู่ในระบบแล้ว');
    return this.prisma.position.create({
      data: { name, description }
    });
  }`
);

// updatePosition
content = content.replace(
  /async updatePosition\(id: string, data: \{ name\?: string; description\?: string \}\) \{\s+return this\.prisma\.position\.update\(\{\s+where: \{ id \},\s+data\s+\}\);\s+\}/,
  `async updatePosition(id: string, data: { name?: string; description?: string }) {
    if (data.name) {
      const existing = await this.prisma.position.findFirst({ where: { name: data.name, id: { not: id }, deletedAt: null } });
      if (existing) throw new BadRequestException('ชื่อตำแหน่งนี้มีอยู่ในระบบแล้ว');
    }
    return this.prisma.position.update({
      where: { id },
      data
    });
  }`
);

fs.writeFileSync(file, content);
