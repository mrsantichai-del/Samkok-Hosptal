const fs = require('fs');
const file = 'src/employee/employee.controller.ts';
let content = fs.readFileSync(file, 'utf8');

const badDecorators = `  @Roles('System Administrator', 'Finance Officer', 'Executive')
  @Get(':id')
  @ApiOperation({ summary: 'Get an employee by ID' })
  
  @Roles('System Administrator', 'Finance Officer')
  @Post(':id/create-user')`;

const goodDecorators = `  @Roles('System Administrator', 'Finance Officer')
  @Post(':id/create-user')`;

content = content.replace(badDecorators, goodDecorators);

fs.writeFileSync(file, content);
console.log('Fixed broken decorators in EmployeeController');
