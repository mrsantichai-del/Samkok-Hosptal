const fs = require('fs');
const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace table headers using regex
const regex = /<TableHeader>[\s\S]*?<TableRow>[\s\S]*?<TableHead className="w-\[60px\] text-center">ลำดับ<\/TableHead>[\s\S]*?<TableHead>รหัสพนักงาน<\/TableHead>[\s\S]*?<TableHead>ชื่อ - นามสกุล<\/TableHead>[\s\S]*?<TableHead>ตำแหน่ง<\/TableHead>[\s\S]*?<TableHead>ประเภทพนักงาน<\/TableHead>[\s\S]*?<TableHead>สถานะ<\/TableHead>[\s\S]*?<TableHead className="w-\[120px\]">จัดการ<\/TableHead>[\s\S]*?<\/TableRow>[\s\S]*?<\/TableHeader>/m;

const newTableHeaders = `            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">ลำดับ</TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('employeeCode')}>
                  รหัสพนักงาน {renderSortIcon('employeeCode')}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('name')}>
                  ชื่อ - นามสกุล {renderSortIcon('name')}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('positionName')}>
                  ตำแหน่ง {renderSortIcon('positionName')}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('typeName')}>
                  ประเภทพนักงาน {renderSortIcon('typeName')}
                </TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="w-[120px]">จัดการ</TableHead>
              </TableRow>
            </TableHeader>`;

content = content.replace(regex, newTableHeaders);

fs.writeFileSync(file, content);
console.log('Fixed employees table headers');
