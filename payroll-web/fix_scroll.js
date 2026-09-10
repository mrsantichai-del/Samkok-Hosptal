const fs = require('fs');
let file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<CommandList>/g,
  '<CommandList className="max-h-[300px] overflow-y-auto">'
);

fs.writeFileSync(file, content);
console.log('Added max height and scroll to CommandList');
