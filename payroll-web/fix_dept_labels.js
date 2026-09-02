const fs = require('fs');

const file = 'src/app/dashboard/departments/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix headers and labels
content = content.replace(
  '<h1 className="text-2xl font-bold">ประเภทพนักงาน</h1>',
  '<h1 className="text-2xl font-bold">แผนก</h1>'
);

content = content.replace(
  '<p className="text-gray-500 text-sm mt-1">ตั้งค่าประเภทพนักงาน เช่น ข้าราชการ, ลจ.ประจำ, พนักงาน, พกส. ฯลฯ</p>',
  '<p className="text-gray-500 text-sm mt-1">ตั้งค่าแผนก/ฝ่ายต่างๆ ในองค์กร</p>'
);

content = content.replace(
  '<Plus className="mr-2 h-4 w-4" /> เพิ่มประเภทใหม่',
  '<Plus className="mr-2 h-4 w-4" /> เพิ่มแผนกใหม่'
);

content = content.replace(
  'placeholder="ค้นหาประเภท..."',
  'placeholder="ค้นหาแผนก..."'
);

// Fix TableHead
content = content.replace(
  '<TableHead>ประเภทพนักงาน</TableHead>',
  '<TableHead>ลำดับ</TableHead>\n              <TableHead>แผนก</TableHead>'
);
// Wait, the table head already has 3 elements but 4 body cells.
// The old code:
// <TableHead>ประเภทพนักงาน</TableHead>
// <TableHead>รายละเอียดเพิ่มเติม</TableHead>
// <TableHead className="w-[120px]">จัดการ</TableHead>

content = content.replace(
  /<TableHeader>[\s\S]*?<\/TableHeader>/,
  `<TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-center">ลำดับ</TableHead>
              <TableHead>แผนก</TableHead>
              <TableHead>รายละเอียดเพิ่มเติม</TableHead>
              <TableHead className="w-[120px]">จัดการ</TableHead>
            </TableRow>
          </TableHeader>`
);

content = content.replace(
  'ไม่พบข้อมูลประเภทพนักงาน',
  'ไม่พบข้อมูลแผนก'
);

content = content.replace(
  'editingItem ? "แก้ไขประเภทพนักงาน" : "เพิ่มประเภทพนักงานใหม่"',
  'editingItem ? "แก้ไขแผนก" : "เพิ่มแผนกใหม่"'
);

content = content.replace(
  'ชื่อประเภทพนักงาน (เช่น ข้าราชการ)',
  'ชื่อแผนก'
);

content = content.replace(
  'placeholder="กรอกชื่อประเภท"',
  'placeholder="กรอกชื่อแผนก"'
);

// Fix duplicated sort blocks
const badBlock = `<div className="flex gap-4">
            <div className="flex gap-4">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="ค้นหาแผนก..." 
                className="pl-9 bg-[#f0f2f5] border-none" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">เรียงลำดับ:</Label>
              <select 
                className="h-10 border rounded px-3 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                value={sortOrder} 
                onChange={e => setSortOrder(e.target.value)}
              >
                <option value="asc">ชื่อ (ก-ฮ)</option>
                <option value="desc">ชื่อ (ฮ-ก)</option>
              </select>
            </div>
          </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">เรียงลำดับ:</Label>
              <select 
                className="h-10 border rounded px-3 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                value={sortOrder} 
                onChange={e => setSortOrder(e.target.value)}
              >
                <option value="asc">ชื่อ (ก-ฮ)</option>
                <option value="desc">ชื่อ (ฮ-ก)</option>
              </select>
            </div>
          </div>`;

const goodBlock = `<div className="flex gap-4">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="ค้นหาแผนก..." 
                className="pl-9 bg-[#f0f2f5] border-none" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">เรียงลำดับ:</Label>
              <select 
                className="h-10 border rounded px-3 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                value={sortOrder} 
                onChange={e => setSortOrder(e.target.value)}
              >
                <option value="asc">ชื่อ (ก-ฮ)</option>
                <option value="desc">ชื่อ (ฮ-ก)</option>
              </select>
            </div>
          </div>`;

content = content.replace(badBlock, goodBlock);

fs.writeFileSync(file, content);
console.log('Fixed labels and duplicate code in departments page');
