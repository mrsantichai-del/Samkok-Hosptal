const fs = require('fs');
const file = 'src/employee/employee.controller.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /createPosition\(@Body\(\) body: \{ name: string; description\?: string \}\) \{/,
  'createPosition(@Body() body: { name: string; description?: string; departmentId?: string }) {'
);
content = content.replace(
  /return this\.employeeService\.createPosition\(body\.name, body\.description\);/,
  'return this.employeeService.createPosition(body.name, body.description, body.departmentId);'
);

content = content.replace(
  /updatePosition\(\s*@Param\('id'\) id: string,\s*@Body\(\) body: \{ name: string; description\?: string \}\s*\) \{/,
  'updatePosition(\n    @Param(\'id\') id: string,\n    @Body() body: { name: string; description?: string; departmentId?: string }\n  ) {'
);
content = content.replace(
  /return this\.employeeService\.updatePosition\(id, body\.name, body\.description\);/,
  'return this.employeeService.updatePosition(id, body.name, body.description, body.departmentId);'
);

fs.writeFileSync(file, content);
console.log('Updated employee.controller.ts');
