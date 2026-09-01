const fs = require('fs');

const file = 'src/app/dashboard/departments/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add ArrowUpDown to imports
if (!content.includes('ArrowUpDown')) {
  content = content.replace(
    'import { Plus, Edit, Trash2 } from "lucide-react";',
    'import { Plus, Edit, Trash2, ArrowUpDown } from "lucide-react";'
  );
}

// 2. Add Sort State and logic
const sortStateLogic = `
  // Sort State
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedDepartments = React.useMemo(() => {
    let sortableItems = [...departments];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key] || '';
        let bValue = b[sortConfig.key] || '';

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [departments, sortConfig]);
  
  const renderSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>;
    }
    return <ArrowUpDown className="ml-1 h-3 w-3 inline-block text-gray-400" />;
  };
`;

if (!content.includes('const [sortConfig')) {
  content = content.replace(
    'const [deleteItem, setDeleteItem] = useState<any>(null);',
    sortStateLogic + '\n  const [deleteItem, setDeleteItem] = useState<any>(null);'
  );
  
  // Add React import if missing
  if (!content.includes('import React')) {
    content = content.replace(
      'import { useEffect, useState } from "react";',
      'import React, { useEffect, useState } from "react";'
    );
  }
}

// 3. Replace TableHeaders
const oldTableHeaders = `            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] text-center">ลำดับ</TableHead>
                <TableHead>ชื่อแผนก</TableHead>
                <TableHead>รายละเอียด</TableHead>
                <TableHead className="w-[120px]">จัดการ</TableHead>
              </TableRow>
            </TableHeader>`;

const newTableHeaders = `            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] text-center">ลำดับ</TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('name')}>
                  ชื่อแผนก {renderSortIcon('name')}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('description')}>
                  รายละเอียด {renderSortIcon('description')}
                </TableHead>
                <TableHead className="w-[120px]">จัดการ</TableHead>
              </TableRow>
            </TableHeader>`;

content = content.replace(oldTableHeaders, newTableHeaders);

// 4. Update the map
content = content.replace(
  'departments.map((t: any, index: number) => (',
  'sortedDepartments.map((t: any, index: number) => ('
);

fs.writeFileSync(file, content);
console.log('Added sorting to departments page');
