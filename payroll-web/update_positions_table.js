const fs = require('fs');
const file = 'src/app/dashboard/positions/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add TableHead
content = content.replace(
  /<TableHead className="cursor-pointer hover:bg-gray-50" onClick=\{\(\) => handleSort\('description'\)\}>\s*รายละเอียดเพิ่มเติม \{renderSortIcon\('description'\)\}\s*<\/TableHead>/,
  '<TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort(\'department.name\')}>\n                  กลุ่มงาน {renderSortIcon(\'department.name\')}\n                </TableHead>\n                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort(\'description\')}>\n                  รายละเอียดเพิ่มเติม {renderSortIcon(\'description\')}\n                </TableHead>'
);

// Add TableCell
content = content.replace(
  /<TableCell className="font-medium text-\[#1877f2\]">\{item\.name\}<\/TableCell>/,
  '<TableCell className="font-medium text-[#1877f2]">{item.name}</TableCell>\n                    <TableCell className="text-gray-600">{item.department?.name || "-"}</TableCell>'
);

// Fix colSpan in loading and empty states from 4 to 5
content = content.replace(/colSpan=\{4\}/g, 'colSpan={5}');

fs.writeFileSync(file, content);
console.log('Updated positions/page.tsx table');
