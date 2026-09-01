const fs = require('fs');
const file = 'src/app/dashboard/users/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the Select components with native selects (like employees page) or add labels.
// Since employees page uses native `<select>`, I will just use native `<select>` for consistency and ease of use.
const oldFilters = `<Select value={filterLinkStatus} onValueChange={setFilterLinkStatus}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="สถานะการผูก" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">การผูกทั้งหมด</SelectItem>
                <SelectItem value="LINKED">ผูกพนักงานแล้ว</SelectItem>
                <SelectItem value="UNLINKED">ไม่ได้ผูกพนักงาน</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="กลุ่มผู้ใช้งาน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">กลุ่มผู้ใช้งานทั้งหมด</SelectItem>
                {roles.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterActive} onValueChange={setFilterActive}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="สถานะบัญชี" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">สถานะทั้งหมด</SelectItem>
                <SelectItem value="ACTIVE">เปิดใช้งาน</SelectItem>
                <SelectItem value="INACTIVE">ระงับ</SelectItem>
              </SelectContent>
            </Select>`;

// Note: Because of CRLF and indentation, string replacement might fail.
// So I will use regex or just replace the whole `<div className="flex flex-wrap flex-1 gap-4">...</div>` block.

const newFilters = `
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">การผูกบัญชี:</Label>
              <select className="h-9 border rounded px-2 text-sm bg-gray-50" value={filterLinkStatus} onChange={e => setFilterLinkStatus(e.target.value)}>
                <option value="ALL">ทั้งหมด (All)</option>
                <option value="LINKED">ผูกพนักงานแล้ว</option>
                <option value="UNLINKED">ยังไม่ได้ผูก</option>
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

// It's safer to find the indexes and slice
const startSearchTerm = '<div className="flex flex-wrap flex-1 gap-4">';
const endSearchTerm = '</Button>\n        </div>';

const startIdx = content.indexOf(startSearchTerm);
// The end index is right after the selects, before the Add button
const buttonSearchTerm = '<Button className="bg-[#1877f2] hover:bg-[#166fe5] h-9" onClick={openAddDialog}>';
const btnIdx = content.indexOf(buttonSearchTerm);

if (startIdx !== -1 && btnIdx !== -1) {
  // Extract the part to keep: the search input
  const searchInputPart = `
          <div className="flex flex-wrap flex-1 gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="ค้นหาชื่อผู้ใช้ / รหัสพนักงาน..." 
                className="pl-9 h-9" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
  `;
  
  content = content.slice(0, startIdx) + searchInputPart + newFilters + '\n          </div>\n\n          ' + content.slice(btnIdx);
  fs.writeFileSync(file, content);
  console.log("Updated filters format");
} else {
  console.log("Could not find insertion points");
}
