const fs = require('fs');
let file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the misplaced lines inside the useMemo block
content = content.replace(
  '        });\n  \n  const totalPages = Math.ceil(sortedEmployees.length / rowsPerPage);\n  const paginatedEmployees = sortedEmployees.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);\n  \n      }\n      return sortableItems;\n    }, [filteredEmployees, sortConfig]);',
  '        });\n      }\n      return sortableItems;\n    }, [filteredEmployees, sortConfig]);\n\n  const totalPages = Math.ceil(sortedEmployees.length / rowsPerPage);\n  const paginatedEmployees = sortedEmployees.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);\n'
);

fs.writeFileSync(file, content);
console.log('Fixed pagination logic placement (moved outside useMemo)');
