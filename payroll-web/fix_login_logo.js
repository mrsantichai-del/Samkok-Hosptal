const fs = require('fs');

const file = 'src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const brandHeader = `<div className="flex flex-col justify-center space-y-4">
          <img src="/logo.jpg" alt="Samkok Hospital Logo" className="w-24 h-24 rounded-full object-cover shadow-sm" />
          <h1 className="text-[3.5rem] font-bold text-[#1877f2] leading-none tracking-tight">Samkok Payroll</h1>`;

content = content.replace(
  '<div className="flex flex-col justify-center space-y-4">\n          <h1 className="text-[3.5rem] font-bold text-[#1877f2] leading-none tracking-tight">Samkok Payroll</h1>',
  brandHeader
);

fs.writeFileSync(file, content);
console.log('Added logo to login page');
