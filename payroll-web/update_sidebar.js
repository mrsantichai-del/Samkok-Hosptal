const fs = require('fs');
const file = 'src/app/dashboard/layout.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '{ name: "ประเภทพนักงาน", href: "/dashboard/employee-types", icon: FolderKanban },',
  '{ name: "แผนก", href: "/dashboard/departments", icon: FolderKanban },\n    { name: "ประเภทพนักงาน", href: "/dashboard/employee-types", icon: FolderKanban },'
);

fs.writeFileSync(file, content);
console.log('Added department to sidebar');
