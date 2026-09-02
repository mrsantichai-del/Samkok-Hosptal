const fs = require('fs');

const file = 'src/app/dashboard/layout.tsx';
let content = fs.readFileSync(file, 'utf8');

// Header
content = content.replace(
  '<header className="h-[60px] flex items-center justify-between px-6 bg-white border-b shrink-0">',
  '<header className="h-[60px] flex items-center justify-between px-6 bg-white border-b shrink-0 print:hidden">'
);

// Sidebar
content = content.replace(
  '<aside className="w-[280px] hidden lg:flex flex-col p-2 overflow-y-auto">',
  '<aside className="w-[280px] hidden lg:flex flex-col p-2 overflow-y-auto print:hidden">'
);

// Main Content area: Ensure it takes full width when printing
content = content.replace(
  '<main className="flex-1 overflow-y-auto p-8 bg-[#f0f2f5]">',
  '<main className="flex-1 overflow-y-auto p-8 bg-[#f0f2f5] print:p-0 print:bg-white print:overflow-visible">'
);

fs.writeFileSync(file, content);
console.log('Added print:hidden to dashboard layout');
