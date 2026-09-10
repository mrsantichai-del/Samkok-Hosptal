const fs = require('fs');
let file = 'src/app/dashboard/pay-items/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add searchTerm state
content = content.replace(
  'const [loading, setLoading] = useState(true);',
  'const [loading, setLoading] = useState(true);\n  const [searchTerm, setSearchTerm] = useState("");'
);

// 2. Attach searchTerm to Input
content = content.replace(
  '<Input placeholder="ค้นหารายการ..." className="pl-9 bg-[#f0f2f5] border-none" />',
  '<Input placeholder="ค้นหารายการ..." className="pl-9 bg-[#f0f2f5] border-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />'
);

// 3. Create filtered logic inside the component body, just before return
content = content.replace(
  '  return (',
  '  const filteredPayItems = payItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));\n\n  return ('
);

// 4. Update the map loop to use filteredPayItems
content = content.replace(
  'payItems.map((item) => (',
  'filteredPayItems.map((item) => ('
);

// 5. Update the empty state check to use filteredPayItems.length
content = content.replace(
  'payItems.length === 0 ? (',
  'filteredPayItems.length === 0 ? ('
);

fs.writeFileSync(file, content);
console.log('Search feature added to pay-items!');
