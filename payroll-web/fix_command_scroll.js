const fs = require('fs');
let file = 'src/components/ui/command.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /"no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none",/g,
  '"max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto outline-none",'
);

fs.writeFileSync(file, content);
console.log('Removed no-scrollbar from CommandList');
