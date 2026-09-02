const fs = require('fs');
const file = 'src/app/dashboard/departments/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The block has two "เรียงลำดับ:" labels and selects.
// It looks like:
/*
          <div className="flex gap-4">
            <div className="flex gap-4">
            <div className="relative w-72">
            ...
            </div>
          </div>
*/

// Let's just find the start of the duplicated block and replace it up to the end of the second select.

const startRegex = /<div className="p-4 bg-white border-b flex items-center justify-between">[\s\S]*?<Table className="bg-white">/m;

const replacement = `<div className="p-4 bg-white border-b flex items-center justify-between">
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
        </div>
        <Table className="bg-white">`;

if (content.match(startRegex)) {
  content = content.replace(startRegex, replacement);
  fs.writeFileSync(file, content);
  console.log('Successfully fixed duplicate sort block');
} else {
  console.log('Regex did not match');
}
