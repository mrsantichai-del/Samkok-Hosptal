const fs = require('fs');

const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const [empRes, typeRes, posRes] = await Promise.all([',
  'const [empRes, typeRes, deptRes, posRes] = await Promise.all(['
);

fs.writeFileSync(file, content);
console.log('Fixed Promise.all destructuring');
