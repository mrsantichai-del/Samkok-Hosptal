const fs = require('fs');
const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Enhance table print styles for a formal grid look
content = content.replace(
  '<Table className="bg-white print:text-black font-serif">',
  '<Table className="bg-white print:text-black font-serif print:border-collapse print:[&_th]:border print:[&_td]:border print:[&_th]:border-black print:[&_td]:border-black print:[&_th]:bg-gray-100">'
);

fs.writeFileSync(file, content);
console.log('Added formal grid borders for print');
