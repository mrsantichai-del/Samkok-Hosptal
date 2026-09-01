const fs = require('fs');
const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add ArrowUpDown to imports
content = content.replace(
  'import { Search, Plus, Edit, Trash2, Check, ChevronsUpDown, Download, Upload } from "lucide-react";',
  'import { Search, Plus, Edit, Trash2, Check, ChevronsUpDown, Download, Upload, ArrowUpDown } from "lucide-react";'
);

// 2. Add Sort State and sortedEmployees logic
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

  const sortedEmployees = React.useMemo(() => {
    let sortableItems = [...filteredEmployees];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key] || '';
        let bValue = b[sortConfig.key] || '';
        
        if (sortConfig.key === 'positionName') {
          aValue = a.position?.name || '';
          bValue = b.position?.name || '';
        } else if (sortConfig.key === 'typeName') {
          aValue = a.employeeType?.name || '';
          bValue = b.employeeType?.name || '';
        } else if (sortConfig.key === 'name') {
          aValue = \`\${a.firstName} \${a.lastName}\`;
          bValue = \`\${b.firstName} \${b.lastName}\`;
        }

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
  }, [filteredEmployees, sortConfig]);
  
  const renderSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>;
    }
    return <ArrowUpDown className="ml-1 h-3 w-3 inline-block text-gray-400" />;
  };
`;

if (!content.includes('const [sortConfig')) {
  // Insert right after filteredEmployees
  content = content.replace(
    '  const [saving, setSaving] = useState(false);',
    sortStateLogic + '\n  const [saving, setSaving] = useState(false);'
  );
  
  // also add React to imports if needed, it's used as React.useMemo
  if (!content.includes('import React')) {
    content = content.replace(
      'import { useEffect, useState, useRef } from "react";',
      'import React, { useEffect, useState, useRef } from "react";'
    );
  }
}

// 3. Replace TableHeaders
const oldTableHeaders = `            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">ลำดับ</TableHead>
                  <TableHead>รหัสพนักงาน</TableHead>
                <TableHead>ชื่อ - นามสกุล</TableHead>
                <TableHead>ตำแหน่ง</TableHead>
                  <TableHead>ประเภทพนักงาน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="w-[120px]">จัดการ</TableHead>
              </TableRow>
            </TableHeader>`;

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

content = content.replace(oldTableHeaders, newTableHeaders);

// 4. Update the map
content = content.replace(
  'filteredEmployees.map((emp, index) => (',
  'sortedEmployees.map((emp, index) => ('
);

// 5. Update Excel export
content = content.replace(
  'const data = filteredEmployees.map(emp => ({',
  'const data = sortedEmployees.map(emp => ({'
);

fs.writeFileSync(file, content);
console.log('Updated employees table with sorting capability');
