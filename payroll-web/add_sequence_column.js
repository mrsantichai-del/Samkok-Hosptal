const fs = require('fs');

const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add TableHead for ลำดับ
content = content.replace(
  '<TableHead>รหัสพนักงาน</TableHead>',
  '<TableHead className="w-[60px] text-center">ลำดับ</TableHead>\n                <TableHead>รหัสพนักงาน</TableHead>'
);

// 2. Fix colSpan (from 6 to 7)
content = content.replace(/colSpan=\{6\}/g, 'colSpan={7}');

// 3. Add TableCell for index
// First update the map signature to include index
content = content.replace(
  'filteredEmployees.map((emp) => (',
  'filteredEmployees.map((emp, index) => ('
);

// Then add the cell
content = content.replace(
  '<TableCell className="font-medium">{emp.employeeCode}</TableCell>',
  '<TableCell className="text-center text-gray-500">{index + 1}</TableCell>\n                    <TableCell className="font-medium">{emp.employeeCode}</TableCell>'
);

fs.writeFileSync(file, content);
