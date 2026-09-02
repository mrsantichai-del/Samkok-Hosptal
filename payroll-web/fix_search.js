const fs = require('fs');

const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldSearch = `const matchSearch = emp.firstName.includes(searchTerm) || emp.lastName.includes(searchTerm) || 
emp.employeeCode.includes(searchTerm);`;

const newSearch = `const s = searchTerm.toLowerCase();
      const matchSearch = (emp.firstName || "").toLowerCase().includes(s) || 
                          (emp.lastName || "").toLowerCase().includes(s) || 
                          (emp.employeeCode || "").toLowerCase().includes(s);`;

// Wait, the formatting in the file might be on one line
const searchRegex = /const matchSearch = emp\.firstName\.includes\(searchTerm\) \|\| emp\.lastName\.includes\(searchTerm\) \|\|\s*emp\.employeeCode\.includes\(searchTerm\);/;

if (content.match(searchRegex)) {
  content = content.replace(searchRegex, newSearch);
  fs.writeFileSync(file, content);
  console.log('Fixed search to be case-insensitive');
} else {
  console.log('Could not find matchSearch in employees page');
}
