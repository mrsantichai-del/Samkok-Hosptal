const fs = require('fs');
let file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Just remove all instances of the two lines
content = content.replace(/const totalPages = Math\.ceil\(sortedEmployees\.length \/ rowsPerPage\);\n/g, '');
content = content.replace(/const paginatedEmployees = sortedEmployees\.slice\(\(currentPage - 1\) \* rowsPerPage, currentPage \* rowsPerPage\);\n/g, '');

// And add them back right after useMemo ends
content = content.replace(
  '}, [filteredEmployees, sortConfig]);',
  '}, [filteredEmployees, sortConfig]);\n\n  const totalPages = Math.ceil(sortedEmployees.length / rowsPerPage);\n  const paginatedEmployees = sortedEmployees.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);\n'
);

fs.writeFileSync(file, content);
console.log('Fixed properly!');
