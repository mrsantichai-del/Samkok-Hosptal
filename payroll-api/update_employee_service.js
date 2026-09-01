const fs = require('fs');

const file = 'src/employee/employee.service.ts';
let content = fs.readFileSync(file, 'utf8');

// Update create method
content = content.replace(
  /async create\(createEmployeeDto: CreateEmployeeDto\) \{[\s\S]*?return this\.prisma\.employee\.create\(\{/,
  `async create(createEmployeeDto: CreateEmployeeDto) {
    let employeeCode = createEmployeeDto.employeeCode;
    
    if (employeeCode) {
      const existing = await this.prisma.employee.findFirst({ where: { employeeCode, deletedAt: null } });
      if (existing) throw new BadRequestException('รหัสพนักงานนี้มีอยู่ในระบบแล้ว');
    } else {
      employeeCode = \`EMP-\${Date.now().toString().slice(-6)}\`;
    }
    
    return this.prisma.employee.create({`
);

// Update update method
content = content.replace(
  /async update\(id: string, updateEmployeeDto: UpdateEmployeeDto\) \{[\s\S]*?return this\.prisma\.employee\.update\(\{/,
  `async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    await this.findOne(id); // ensure exists
    
    if (updateEmployeeDto.employeeCode) {
      const existing = await this.prisma.employee.findFirst({ 
        where: { employeeCode: updateEmployeeDto.employeeCode, id: { not: id }, deletedAt: null } 
      });
      if (existing) throw new BadRequestException('รหัสพนักงานนี้มีอยู่ในระบบแล้ว');
    }

    return this.prisma.employee.update({`
);

fs.writeFileSync(file, content);
