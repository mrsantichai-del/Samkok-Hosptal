const fs = require('fs');

const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldPayload = `      const payload = {
        firstName,
        lastName,
        idCard: idCard || undefined,
        employeeTypeId: employeeTypeId === "unassigned" ? null : employeeTypeId,
        departmentId: departmentId === "unassigned" ? null : departmentId,
        positionId: positionId === "unassigned" ? null : positionId
      };`;

const newPayload = `      const payload = {
        employeeCode: employeeCode || undefined,
        firstName,
        lastName,
        idCard: idCard || undefined,
        employeeTypeId: employeeTypeId === "unassigned" ? null : employeeTypeId,
        departmentId: departmentId === "unassigned" ? null : departmentId,
        positionId: positionId === "unassigned" ? null : positionId
      };`;

if (content.includes('const payload = {')) {
  content = content.replace(oldPayload, newPayload);
  fs.writeFileSync(file, content);
  console.log('Fixed payload in frontend');
} else {
  console.log('Could not find payload in frontend');
}
