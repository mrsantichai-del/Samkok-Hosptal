const fs = require('fs');
const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Header
const headerRegex = /<TableHead className="cursor-pointer hover:bg-gray-50" onClick=\{\(\) => handleSort\('typeName'\)\}>[\s\S]*?ประเภทพนักงาน \{renderSortIcon\('typeName'\)\}[\s\S]*?<\/TableHead>/;

if (content.match(headerRegex)) {
  content = content.replace(
    headerRegex,
    '<TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort(\'typeName\')}>\n                  ประเภทพนักงาน {renderSortIcon(\'typeName\')}\n                </TableHead>\n                <TableHead>ผู้ใช้งาน</TableHead>'
  );
  console.log("Replaced header!");
} else {
  console.log("Header regex failed");
}

// 2. Add Body Cell
const bodyRegex = /<TableCell>\s*\{emp\.employeeType\?\.name \? \([\s\S]*?<\/TableCell>/;

const newBodyCell = `<TableCell>
                    {emp.employeeType?.name ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {emp.employeeType.name}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    {emp.user ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                        <Check className="h-3 w-3" /> สร้างแล้ว
                      </span>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs bg-white text-[#1877f2] border-[#1877f2] hover:bg-[#1877f2] hover:text-white"
                        onClick={() => handleCreateUser(emp)}
                        disabled={savingUser === emp.id}
                      >
                        {savingUser === emp.id ? "กำลังสร้าง..." : "สร้าง User"}
                      </Button>
                    )}
                  </TableCell>`;

if (content.match(bodyRegex)) {
  content = content.replace(bodyRegex, newBodyCell);
  console.log("Replaced body cell!");
} else {
  console.log("Body regex failed");
}

fs.writeFileSync(file, content);
console.log('Done');
