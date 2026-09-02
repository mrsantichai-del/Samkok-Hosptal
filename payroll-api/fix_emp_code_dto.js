const fs = require('fs');
const file = 'src/employee/dto/create-employee.dto.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '@ApiProperty()\n  @IsString()\n  employeeCode: string;',
  '@ApiProperty({ required: false })\n  @IsString()\n  @IsOptional()\n  employeeCode?: string;'
);

fs.writeFileSync(file, content);
console.log('Made employeeCode optional in DTO');
