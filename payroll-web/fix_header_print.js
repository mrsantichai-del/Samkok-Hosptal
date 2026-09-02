const fs = require('fs');
const file = 'src/app/dashboard/layout.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm h-14 flex items-center\s+px-4 justify-between">/;

if (content.match(regex)) {
  content = content.replace(regex, '<header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm h-14 flex items-center px-4 justify-between print:hidden">');
  fs.writeFileSync(file, content);
  console.log('Added print:hidden to header');
} else {
  console.log('Regex failed');
}
