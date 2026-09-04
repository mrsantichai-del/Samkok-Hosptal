const fs = require('fs');
const file = 'src/app/dashboard/positions/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<SelectValue placeholder="เลือกกลุ่มงาน" />',
  '<SelectValue placeholder="เลือกกลุ่มงาน">\n                      {departmentId && departmentId !== "unassigned" ? (departments.find(d => d.id === departmentId)?.name || departmentId) : "เลือกกลุ่มงาน"}\n                    </SelectValue>'
);

fs.writeFileSync(file, content);
console.log('Fixed SelectValue to show Thai name');
