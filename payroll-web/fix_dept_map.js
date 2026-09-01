const fs = require('fs');

let deptContent = fs.readFileSync('src/app/dashboard/departments/page.tsx', 'utf8');
deptContent = deptContent.replace(
  'filteredDepartments.map((item) => (',
  'sortedDepartments.map((item: any, index: number) => ('
);
deptContent = deptContent.replace(
  /let sortableItems = \[\.\.\.departments\];/g,
  `let sortableItems = [...filteredDepartments];`
);
deptContent = deptContent.replace(
  /\[departments, sortConfig\]/g,
  `[filteredDepartments, sortConfig]`
);

// Also change "ไม่พบข้อมูลประเทพนักงาน" to "ไม่พบข้อมูลแผนก"
deptContent = deptContent.replace(
  'ไม่พบข้อมูลประเทพนักงาน',
  'ไม่พบข้อมูลแผนก'
);
fs.writeFileSync('src/app/dashboard/departments/page.tsx', deptContent);

let etContent = fs.readFileSync('src/app/dashboard/employee-types/page.tsx', 'utf8');
if (etContent.includes('filteredTypes.map')) {
  etContent = etContent.replace(
    'filteredTypes.map((item) => (',
    'sortedData.map((item: any, index: number) => ('
  );
  etContent = etContent.replace(
    /let sortableItems = \[\.\.\.types\];/g,
    `let sortableItems = [...filteredTypes];`
  );
  etContent = etContent.replace(
    /\[types, sortConfig\]/g,
    `[filteredTypes, sortConfig]`
  );
  fs.writeFileSync('src/app/dashboard/employee-types/page.tsx', etContent);
}

console.log('Fixed maps');
