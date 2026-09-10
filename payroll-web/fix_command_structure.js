const fs = require('fs');
let file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// For Departments
content = content.replace(
  /<CommandEmpty>ไม่พบกลุ่มงาน<\/CommandEmpty>\s*<CommandGroup>\s*<CommandList className="max-h-\[300px\] overflow-y-auto">/g,
  '<CommandList className="max-h-[300px] overflow-y-auto">\n                      <CommandEmpty>ไม่พบกลุ่มงาน</CommandEmpty>\n                      <CommandGroup>'
);
content = content.replace(
  /<\/CommandList>\s*<\/CommandGroup>\s*<\/Command>/g,
  '</CommandGroup>\n                      </CommandList>\n                    </Command>'
);

// For Positions
content = content.replace(
  /<CommandEmpty>ไม่พบตำแหน่ง<\/CommandEmpty>\s*<CommandGroup>\s*<CommandList className="max-h-\[300px\] overflow-y-auto">/g,
  '<CommandList className="max-h-[300px] overflow-y-auto">\n                      <CommandEmpty>ไม่พบตำแหน่ง</CommandEmpty>\n                      <CommandGroup>'
);

// For Employee Types
content = content.replace(
  /<CommandEmpty>ไม่พบประเภทพนักงาน<\/CommandEmpty>\s*<CommandGroup>\s*<CommandList className="max-h-\[300px\] overflow-y-auto">/g,
  '<CommandList className="max-h-[300px] overflow-y-auto">\n                      <CommandEmpty>ไม่พบประเภทพนักงาน</CommandEmpty>\n                      <CommandGroup>'
);

fs.writeFileSync(file, content);
console.log('Fixed Command structure');
