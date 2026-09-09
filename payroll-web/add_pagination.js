const fs = require('fs');
let file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add pagination states after existing states
const paginationStates = `
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;
`;
content = content.replace('// Filter States', paginationStates + '\n  // Filter States');

// 2. Reset page when filters change
content = content.replace(
  'const filteredEmployees = employees.filter(emp => {',
  `useEffect(() => { setCurrentPage(1); }, [searchTerm, filterPositionId, filterDepartmentId, filterTypeId, filterStatus]);

  const filteredEmployees = employees.filter(emp => {`
);

// 3. Slice sortedEmployees
const paginationLogic = `
  const totalPages = Math.ceil(sortedEmployees.length / rowsPerPage);
  const paginatedEmployees = sortedEmployees.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
`;
content = content.replace(
  /const handleCreateUser = async/,
  paginationLogic + '\n  const handleCreateUser = async'
);

// 4. Change map to paginatedEmployees and adjust index
content = content.replace(
  /sortedEmployees\.map\(\(emp, index\) => \(/,
  'paginatedEmployees.map((emp, index) => ('
);
content = content.replace(
  /<TableCell className="text-center text-gray-500">\{index \+ 1\}<\/TableCell>/,
  '<TableCell className="text-center text-gray-500 text-xs">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>'
);

// 5. Shrink columns (Add text-xs, truncate, max-w)
content = content.replace(
  /<TableCell>\{emp\.firstName\} \{emp\.lastName\}<\/TableCell>/,
  '<TableCell className="text-xs">{emp.firstName} {emp.lastName}</TableCell>'
);
content = content.replace(
  /<TableCell className="font-medium">\{emp\.employeeCode\}<\/TableCell>/,
  '<TableCell className="font-medium text-xs">{emp.employeeCode}</TableCell>'
);
content = content.replace(
  /<TableCell className="text-gray-600">\s*\{emp\.department\?\.name \|\| "-"\}\s*<\/TableCell>/,
  '<TableCell className="text-gray-600 text-xs max-w-[150px] truncate" title={emp.department?.name || "-"}>\n                      {emp.department?.name || "-"}\n                    </TableCell>'
);
content = content.replace(
  /<TableCell className="text-gray-600">\s*\{emp\.position\?\.name \|\| "-"\}\s*<\/TableCell>/,
  '<TableCell className="text-gray-600 text-xs max-w-[150px] truncate" title={emp.position?.name || "-"}>\n                      {emp.position?.name || "-"}\n                    </TableCell>'
);
content = content.replace(
  /<TableCell>\{emp\.employeeType\?\.name \|\| "-"\}<\/TableCell>/,
  '<TableCell className="text-xs">{emp.employeeType?.name || "-"}</TableCell>'
);
content = content.replace(
  /<TableCell className="text-right font-medium text-emerald-600">/,
  '<TableCell className="text-right font-medium text-emerald-600 text-xs">'
);

// 6. Add pagination UI below table
const paginationUI = `
          </Table>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-500">
                แสดงผล {(currentPage - 1) * rowsPerPage + 1} ถึง {Math.min(currentPage * rowsPerPage, sortedEmployees.length)} จากทั้งหมด {sortedEmployees.length} รายการ
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ก่อนหน้า
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className={currentPage === page ? "bg-[#1877f2]" : ""}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          )}
        </Card>
`;
content = content.replace(/<\/Table>\s*<\/Card>/, paginationUI);

fs.writeFileSync(file, content);
console.log('Added pagination and column shrinkage to employees page');
