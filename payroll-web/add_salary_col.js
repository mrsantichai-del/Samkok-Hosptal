const fs = require('fs');
const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update TableHeader
if (!content.includes('เงินเดือนพื้นฐาน')) {
  content = content.replace(
    '<TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort(\'typeName\')}>\n                    ประเภทพนักงาน {renderSortIcon(\'typeName\')}\n                  </TableHead>',
    '<TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort(\'typeName\')}>\n                    ประเภทพนักงาน {renderSortIcon(\'typeName\')}\n                  </TableHead>\n                  <TableHead className="cursor-pointer hover:bg-gray-50 text-right" onClick={() => handleSort(\'baseSalary\')}>\n                    เงินเดือนพื้นฐาน {renderSortIcon(\'baseSalary\')}\n                  </TableHead>'
  );

  // Update TableCell
  content = content.replace(
    '<TableCell>{emp.employeeType?.name || "-"}</TableCell>',
    '<TableCell>{emp.employeeType?.name || "-"}</TableCell>\n                      <TableCell className="text-right font-medium text-emerald-600">\n                        {emp.baseSalary ? Number(emp.baseSalary).toLocaleString(\'th-TH\', { minimumFractionDigits: 2 }) : "-"}\n                      </TableCell>'
  );

  // Update colSpans for empty/loading states (8 -> 9)
  content = content.replace(/colSpan=\{8\}/g, 'colSpan={9}');

  fs.writeFileSync(file, content);
  console.log('Added baseSalary to Employee table');
}
