const fs = require('fs');

const file = 'src/app/dashboard/users/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const searchCode = `          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="ค้นหาชื่อผู้ใช้ / รหัสพนักงาน..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>`;

const newFiltersCode = `
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">การผูกบัญชี:</Label>
              <select className="h-9 border rounded px-2 text-sm bg-gray-50" value={filterLinkStatus} onChange={e => setFilterLinkStatus(e.target.value)}>
                <option value="ALL">ทั้งหมด (All)</option>
                <option value="LINKED">ผูกพนักงานแล้ว</option>
                <option value="UNLINKED">ไม่ได้ผูก</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">กลุ่มผู้ใช้งาน:</Label>
              <select className="h-9 border rounded px-2 text-sm bg-gray-50" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                <option value="ALL">ทั้งหมด (All)</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">สถานะ:</Label>
              <select className="h-9 border rounded px-2 text-sm bg-gray-50" value={filterActive} onChange={e => setFilterActive(e.target.value)}>
                <option value="ALL">ทั้งหมด (All)</option>
                <option value="ACTIVE">เปิดใช้งาน</option>
                <option value="INACTIVE">ระงับ</option>
              </select>
            </div>
`;

// Find where Select block starts
const selectStart = content.indexOf('<Select value={filterLinkStatus}');
const selectEnd = content.indexOf('</Select>', content.indexOf('<Select value={filterActive}')) + 9;

if (selectStart !== -1 && selectEnd !== -1) {
  content = content.slice(0, selectStart) + newFiltersCode + content.slice(selectEnd);
  fs.writeFileSync(file, content);
  console.log("Updated filters format");
} else {
  console.log("Could not find Select block");
}
