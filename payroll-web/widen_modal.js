const fs = require('fs');
let file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Expand the Dialog width
content = content.replace(
  'DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden"',
  'DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden"'
);

// 2. Widen the grid gap
content = content.replace(
  '<div className="grid grid-cols-2 gap-6">',
  '<div className="grid grid-cols-2 gap-8 lg:gap-12">'
);

// 3. Fix the label truncation for Income
content = content.replace(
  /<Label className="text-xs text-gray-600 truncate mr-2"/g,
  '<Label className="text-sm text-gray-700 font-medium mr-4 leading-snug"'
);

// 4. Make Input larger text for better readability
content = content.replace(
  /className="h-8 w-32 text-right text-xs focus-visible:ring-green-500"/g,
  'className="h-9 w-32 md:w-40 flex-shrink-0 text-right text-sm focus-visible:ring-green-500"'
);

// 5. Make Input larger text for deductions
content = content.replace(
  /className="h-8 w-32 text-right text-xs focus-visible:ring-red-500"/g,
  'className="h-9 w-32 md:w-40 flex-shrink-0 text-right text-sm focus-visible:ring-red-500"'
);

// 6. Fix footer wrapping by making the gap bigger and wrapping allowed
content = content.replace(
  '<div className="flex justify-between items-center mb-4 text-sm">',
  '<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 text-sm gap-4">'
);

fs.writeFileSync(file, content);
console.log('Fixed Modal size and truncation!');
