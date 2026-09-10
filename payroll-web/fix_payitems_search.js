const fs = require('fs');
let file = 'src/app/dashboard/pay-items/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add debounced search state
content = content.replace(
  'const [searchTerm, setSearchTerm] = useState("");',
  `const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);`
);

// 2. Use debounced search in filter
content = content.replace(
  'const filteredPayItems = payItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));',
  'const filteredPayItems = payItems.filter(item => item.name.toLowerCase().includes(debouncedSearch.toLowerCase()));'
);

// 3. Add TableHead for Index
content = content.replace(
  '<TableHead>ชื่อรายการ</TableHead>',
  '<TableHead className="w-[60px] text-center">ลำดับที่</TableHead>\n                <TableHead>ชื่อรายการ</TableHead>'
);

// 4. Update colSpans
content = content.replace(
  /colSpan=\{4\}/g,
  'colSpan={5}'
);

// 5. Add index parameter to map
content = content.replace(
  'filteredPayItems.map((item) => (',
  'filteredPayItems.map((item, index) => ('
);

// 6. Add TableCell for index
content = content.replace(
  '<TableCell className="font-medium">{item.name}</TableCell>',
  '<TableCell className="text-center text-gray-500">{index + 1}</TableCell>\n                    <TableCell className="font-medium">{item.name}</TableCell>'
);

fs.writeFileSync(file, content);
console.log('Added debounce and index column to pay-items');
