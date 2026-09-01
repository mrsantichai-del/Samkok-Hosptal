const fs = require('fs');
const serviceFile = 'src/employee/employee.service.ts';
let serviceContent = fs.readFileSync(serviceFile, 'utf8');

const departmentMethods = `
  async getDepartments() {
    return this.prisma.department.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    });
  }

  async createDepartment(data: { name: string; description?: string }) {
    return this.prisma.department.create({ data });
  }

  async updateDepartment(id: string, data: { name?: string; description?: string }) {
    return this.prisma.department.update({ where: { id }, data });
  }

  async deleteDepartment(id: string) {
    return this.prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
`;

if (!serviceContent.includes('getDepartments()')) {
  serviceContent = serviceContent.replace(
    '  async getPositions() {',
    departmentMethods + '\n  async getPositions() {'
  );
  fs.writeFileSync(serviceFile, serviceContent);
  console.log('Added department methods to service');
} else {
  console.log('Already added');
}
