const fs = require('fs');

function fixTableHeaders(file, nameLabel) {
  let content = fs.readFileSync(file, 'utf8');

  // Find the TableHeader block
  const tableHeaderRegex = /<TableHeader>[\s\S]*?<\/TableHeader>/;
  
  const newHeader = `<TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-center">ลำดับ</TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('name')}>
                ${nameLabel} {renderSortIcon('name')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('description')}>
                รายละเอียดเพิ่มเติม {renderSortIcon('description')}
              </TableHead>
              <TableHead className="w-[120px]">จัดการ</TableHead>
            </TableRow>
          </TableHeader>`;
          
  if (content.match(tableHeaderRegex)) {
    content = content.replace(tableHeaderRegex, newHeader);
    fs.writeFileSync(file, content);
    console.log('Fixed headers in ' + file);
  } else {
    console.log('Could not find TableHeader in ' + file);
  }
}

fixTableHeaders('src/app/dashboard/departments/page.tsx', 'แผนก');
fixTableHeaders('src/app/dashboard/employee-types/page.tsx', 'ประเภทพนักงาน');
fixTableHeaders('src/app/dashboard/positions/page.tsx', 'ตำแหน่ง');
