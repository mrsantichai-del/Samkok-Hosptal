const fs = require('fs');

const file = 'src/app/dashboard/departments/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace types with departments and filteredTypes with filteredDepartments
content = content.replace(
  'const filteredTypes = types.filter(item =>',
  'const filteredDepartments = departments.filter(item =>'
);

content = content.replace(
  'ไม่พบข้อมูลประเทพนักงาน',
  'ไม่พบข้อมูลแผนก'
);

// Wait, the table header replacement probably missed it in previous script or I re-replaced it wrongly.
// Let's also check for any remaining "types" that should be "departments"
// But carefully! Only standalone variables.
content = content.replace(/types\.filter/g, 'departments.filter');

fs.writeFileSync(file, content);
console.log('Fixed departments filter logic');
