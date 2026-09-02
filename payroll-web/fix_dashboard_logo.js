const fs = require('fs');

const file = 'src/app/dashboard/layout.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldLogo = `<div className="w-10 h-10 bg-[#1877f2] rounded-full flex items-center justify-center text-white 
font-bold text-xl">
                S
              </div>`;
              
const newLogo = `<img src="/logo.jpg" alt="Samkok Hospital Logo" className="w-10 h-10 rounded-full object-cover border border-gray-200" />`;

// Fix the newline formatting issue for replacement
content = content.replace(
  /<div className="w-10 h-10 bg-\[#1877f2\] rounded-full flex items-center justify-center text-white\s*font-bold text-xl">\s*S\s*<\/div>/m,
  newLogo
);

fs.writeFileSync(file, content);
console.log('Fixed dashboard logo');
