const fs = require('fs');
let file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the misplaced pagination logic
const badLogicRegex = /\s*const totalPages = Math\.ceil\(sortedEmployees\.length \/ rowsPerPage\);\s*const paginatedEmployees = sortedEmployees\.slice\(\(currentPage - 1\) \* rowsPerPage, currentPage \* rowsPerPage\);\s*/g;
content = content.replace(badLogicRegex, '\n  ');

// 2. Find where sortedEmployees ends and insert the logic there.
const correctPlaceRegex = /(const sortedEmployees = React\.useMemo\(\(\) => \{[\s\S]*?\}\);)/;
content = content.replace(
  correctPlaceRegex,
  '$1\n\n  const totalPages = Math.ceil(sortedEmployees.length / rowsPerPage);\n  const paginatedEmployees = sortedEmployees.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);\n'
);

fs.writeFileSync(file, content);
console.log('Fixed pagination logic placement');
