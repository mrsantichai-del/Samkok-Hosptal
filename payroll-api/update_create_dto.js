const fs = require('fs');

const file = 'src/employee/dto/create-employee.dto.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('employeeCode?: string;')) {
  content = content.replace(
    'export class CreateEmployeeDto {',
    'export class CreateEmployeeDto {\n  @ApiProperty({ required: false })\n  @IsString()\n  @IsOptional()\n  employeeCode?: string;\n'
  );
  fs.writeFileSync(file, content);
}
