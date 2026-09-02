const fs = require('fs');

const serviceFile = 'src/employee/employee.service.ts';
let serviceContent = fs.readFileSync(serviceFile, 'utf8');

if (!serviceContent.includes('import * as bcrypt')) {
  serviceContent = serviceContent.replace(
    "import { UpdateEmployeeDto } from './dto/update-employee.dto';",
    "import { UpdateEmployeeDto } from './dto/update-employee.dto';\nimport * as bcrypt from 'bcrypt';"
  );
}

const createUserMethod = `
  async createUserAccount(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id, deletedAt: null },
      include: { user: true }
    });

    if (!employee) throw new NotFoundException('Employee not found');
    if (employee.user) throw new BadRequestException('User account already exists for this employee');

    // Make sure Employee role exists
    let employeeRole = await this.prisma.client.role.findFirst({
      where: { name: 'Employee', deletedAt: null }
    });

    if (!employeeRole) {
      employeeRole = await this.prisma.client.role.create({
        data: { name: 'Employee', description: 'General Employee' }
      });
    }

    const passwordHash = await bcrypt.hash(employee.employeeCode, 10);

    const newUser = await this.prisma.client.user.create({
      data: {
        username: employee.employeeCode,
        passwordHash,
        employeeId: employee.id,
        isActive: true,
      }
    });

    await this.prisma.client.userRole.create({
      data: {
        userId: newUser.id,
        roleId: employeeRole.id
      }
    });

    return { success: true, user: newUser };
  }
`;

if (!serviceContent.includes('createUserAccount(id: string)')) {
  serviceContent = serviceContent.replace(
    'async getPositions() {',
    createUserMethod + '\n  async getPositions() {'
  );
  fs.writeFileSync(serviceFile, serviceContent);
  console.log('Added createUserAccount to EmployeeService');
} else {
  console.log('Already added');
}

const controllerFile = 'src/employee/employee.controller.ts';
let controllerContent = fs.readFileSync(controllerFile, 'utf8');

const createUserEndpoint = `
  @Roles('System Administrator', 'Finance Officer')
  @Post(':id/create-user')
  @ApiOperation({ summary: 'Create user account for employee automatically' })
  createUserAccount(@Param('id') id: string) {
    return this.employeeService.createUserAccount(id);
  }
`;

if (!controllerContent.includes('createUserAccount(@Param')) {
  controllerContent = controllerContent.replace(
    "findOne(@Param('id') id: string) {",
    createUserEndpoint + "\n  @Roles('System Administrator', 'Finance Officer', 'Executive')\n  @Get(':id')\n  @ApiOperation({ summary: 'Get an employee by ID' })\n  findOne(@Param('id') id: string) {"
  );
  fs.writeFileSync(controllerFile, controllerContent);
  console.log('Added createUserAccount to EmployeeController');
} else {
  console.log('Already added');
}
