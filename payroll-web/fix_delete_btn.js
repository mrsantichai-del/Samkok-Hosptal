const fs = require('fs');
const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /onClick=\{\(\) => handleDelete\(emp\.id\)\}/g,
  'onClick={() => promptDelete(emp)}'
);

fs.writeFileSync(file, content);
console.log('Fixed handleDelete -> promptDelete');
