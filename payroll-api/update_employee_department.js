const fs = require('fs');

const serviceFile = 'src/employee/employee.service.ts';
let serviceContent = fs.readFileSync(serviceFile, 'utf8');

// Include department in findAll and findOne
if (!serviceContent.includes('department: true')) {
  serviceContent = serviceContent.replace(
    'position: true,',
    'position: true, department: true,'
  ).replace(
    'position: true,',
    'position: true, department: true,'
  ); // replace multiple occurrences if any
}

// Add Department CRUD
const departmentMethods = `
  async getDepartments() {
    return this.prisma.client.department.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    });
  }

  async createDepartment(data: { name: string; description?: string }) {
    return this.prisma.client.department.create({ data });
  }

  async updateDepartment(id: string, data: { name?: string; description?: string }) {
    return this.prisma.client.department.update({ where: { id }, data });
  }

  async deleteDepartment(id: string) {
    return this.prisma.client.department.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
`;

if (!serviceContent.includes('getDepartments()')) {
  serviceContent = serviceContent.replace(
    'async getPositions()',
    departmentMethods + '\n  async getPositions()'
  );
}

fs.writeFileSync(serviceFile, serviceContent);
console.log('Updated employee.service.ts');

const controllerFile = 'src/employee/employee.controller.ts';
let controllerContent = fs.readFileSync(controllerFile, 'utf8');

const departmentEndpoints = `
  @Roles('System Administrator', 'Finance Officer', 'Executive')
  @Get('departments')
  @ApiOperation({ summary: 'Get all departments' })
  getDepartments() {
    return this.employeeService.getDepartments();
  }

  @Roles('System Administrator', 'Finance Officer')
  @Post('departments')
  @ApiOperation({ summary: 'Create department' })
  createDepartment(@Body() body: { name: string; description?: string }) {
    return this.employeeService.createDepartment(body);
  }

  @Roles('System Administrator', 'Finance Officer')
  @Patch('departments/:id')
  @ApiOperation({ summary: 'Update department' })
  updateDepartment(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    return this.employeeService.updateDepartment(id, body);
  }

  @Roles('System Administrator', 'Finance Officer')
  @Delete('departments/:id')
  @ApiOperation({ summary: 'Delete department' })
  deleteDepartment(@Param('id') id: string) {
    return this.employeeService.deleteDepartment(id);
  }
`;

if (!controllerContent.includes('getDepartments()')) {
  controllerContent = controllerContent.replace(
    "  @Get('positions')",
    departmentEndpoints + "\n  @Roles('System Administrator', 'Finance Officer', 'Executive')\n  @Get('positions')"
  );
  
  // Need to fix the replaced string if it was matching exactly
  // The replace might mess up if I don't target perfectly. Let's do it safely:
  controllerContent = controllerContent.replace(
    `@Roles('System Administrator', 'Finance Officer', 'Executive')\n  @Get('positions')`,
    departmentEndpoints + `\n  @Roles('System Administrator', 'Finance Officer', 'Executive')\n  @Get('positions')`
  );
  // Actually, string replace might be duplicated. Let's just use simple replace on the first occurrence.
}
// Clean up in case of duplicated `@Roles(...)`
controllerContent = controllerContent.replace(
  `  @Roles('System Administrator', 'Finance Officer', 'Executive')\n\n  @Roles('System Administrator', 'Finance Officer', 'Executive')\n  @Get('positions')`,
  `  @Roles('System Administrator', 'Finance Officer', 'Executive')\n  @Get('positions')`
);

fs.writeFileSync(controllerFile, controllerContent);
console.log('Updated employee.controller.ts');
