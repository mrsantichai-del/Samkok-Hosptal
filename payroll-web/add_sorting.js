const fs = require('fs');
let file = 'src/app/dashboard/pay-items/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add ArrowUpDown to imports
content = content.replace(
  'import { Search, Plus, Edit, Trash2 } from "lucide-react";',
  'import { Search, Plus, Edit, Trash2, ArrowUpDown } from "lucide-react";'
);
content = content.replace(
  'import { useEffect, useState } from "react";',
  'import React, { useEffect, useState } from "react";'
);

// 2. Add Sort State and Logic
const sortLogic = `
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>;
    }
    return <ArrowUpDown className="ml-1 h-3 w-3 inline-block text-gray-400 opacity-50" />;
  };

  const sortedPayItems = React.useMemo(() => {
    let sortableItems = [...filteredPayItems];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key] || '';
        let bValue = b[sortConfig.key] || '';

        if (sortConfig.key === 'type') {
          aValue = a.type === 'INCOME' ? '1_INCOME' : '2_DEDUCTION';
          bValue = b.type === 'INCOME' ? '1_INCOME' : '2_DEDUCTION';
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredPayItems, sortConfig]);
`;

content = content.replace(
  'const filteredPayItems = payItems.filter(item => item.name.toLowerCase().includes(debouncedSearch.toLowerCase()));',
  'const filteredPayItems = payItems.filter(item => item.name.toLowerCase().includes(debouncedSearch.toLowerCase()));\n' + sortLogic
);

// 3. Update TableHeaders
content = content.replace(
  '<TableHead>ชื่อรายการ</TableHead>',
  '<TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("name")}>ชื่อรายการ {renderSortIcon("name")}</TableHead>'
);
content = content.replace(
  '<TableHead>ประเภท</TableHead>',
  '<TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("type")}>ประเภท {renderSortIcon("type")}</TableHead>'
);
content = content.replace(
  '<TableHead>สูตรคำนวณ (Default)</TableHead>',
  '<TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("defaultFormula")}>สูตรคำนวณ (Default) {renderSortIcon("defaultFormula")}</TableHead>'
);

// 4. Update the map loop to use sortedPayItems
content = content.replace(
  /filteredPayItems\.map/g,
  'sortedPayItems.map'
);

fs.writeFileSync(file, content);
console.log('Sorting logic added!');
