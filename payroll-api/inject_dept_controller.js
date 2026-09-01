const fs = require('fs');
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
  // Find where positions start, insert before it
  const insertionPoint = "@Roles('System Administrator', 'Finance Officer', 'Executive')\n  @Get('positions')";
  
  if (controllerContent.includes(insertionPoint)) {
     controllerContent = controllerContent.replace(insertionPoint, departmentEndpoints + '\n  ' + insertionPoint);
  } else {
     // fallback
     const fallback = "@Get('positions')";
     controllerContent = controllerContent.replace(fallback, departmentEndpoints + '\n  ' + fallback);
  }
  
  fs.writeFileSync(controllerFile, controllerContent);
  console.log('Updated employee.controller.ts');
} else {
  console.log('Already updated');
}
