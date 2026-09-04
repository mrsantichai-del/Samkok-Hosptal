const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace "แผนก" with "กลุ่มงาน"
  content = content.replace(/แผนก/g, 'กลุ่มงาน');
  
  fs.writeFileSync(filePath, content);
  console.log('Updated ' + filePath);
}

replaceInFile('src/app/dashboard/layout.tsx');
replaceInFile('src/app/dashboard/departments/page.tsx');
replaceInFile('src/app/dashboard/employees/page.tsx');
