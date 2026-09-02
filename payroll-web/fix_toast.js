const fs = require('fs');

const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'toast.error();',
  'toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");\n      console.error(e);'
);

fs.writeFileSync(file, content);
console.log('Fixed empty toast');
