const fs = require('fs');

function updatePage(file, entityNameThai) {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add states
  const stateInjection = `  const [saving, setSaving] = useState(false);
  
  // Filtering & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const filteredTypes = types.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    if (sortOrder === "asc") return a.name.localeCompare(b.name, 'th');
    return b.name.localeCompare(a.name, 'th');
  });
`;
  content = content.replace(/  const \[saving, setSaving\] = useState\(false\);/, stateInjection);

  // 2. Update Search Bar + Sort
  const searchInputOriginal = `<div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input placeholder="ค้นหา${entityNameThai}..." className="pl-9 bg-[#f0f2f5] border-none" />
          </div>`;
  const searchInputUpdated = `<div className="flex gap-4">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="ค้นหา${entityNameThai}..." 
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
  content = content.replace(searchInputOriginal, searchInputUpdated);
  // Also handle position where text is slightly different (ค้นหาตำแหน่ง / ค้นหาประเภท)
  if (!content.includes('value={searchTerm}')) {
     const fallbackSearchOriginal = `<div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input placeholder="ค้นหาประเภท..." className="pl-9 bg-[#f0f2f5] border-none" />
          </div>`;
     content = content.replace(fallbackSearchOriginal, searchInputUpdated);
  }


  // 3. Update types.map to filteredTypes.map
  content = content.replace(/types\.map\(\(item\)/, 'filteredTypes.map((item)');
  
  // 4. Update empty state check
  content = content.replace(/types\.length === 0 \?/, 'filteredTypes.length === 0 ?');

  fs.writeFileSync(file, content);
}

updatePage('src/app/dashboard/positions/page.tsx', 'ตำแหน่ง');
updatePage('src/app/dashboard/employee-types/page.tsx', 'ประเภท');
