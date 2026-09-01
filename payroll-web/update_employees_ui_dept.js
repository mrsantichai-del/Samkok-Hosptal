const fs = require('fs');

const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add departments state
content = content.replace(
  'const [positions, setPositions] = useState<any[]>([]);',
  'const [positions, setPositions] = useState<any[]>([]);\n  const [departments, setDepartments] = useState<any[]>([]);'
);

// Fetch departments in fetchOptions
content = content.replace(
  'const [posRes, typeRes] = await Promise.all([',
  'const [posRes, typeRes, deptRes] = await Promise.all(['
);
content = content.replace(
  'axios.get(`${API_URL}/employees/types`, { headers: { Authorization: `Bearer ${token}` } })',
  'axios.get(`${API_URL}/employees/types`, { headers: { Authorization: `Bearer ${token}` } }),\n        axios.get(`${API_URL}/employees/departments`, { headers: { Authorization: `Bearer ${token}` } })'
);
content = content.replace(
  'setEmployeeTypes(typeRes.data);',
  'setEmployeeTypes(typeRes.data);\n      setDepartments(deptRes.data);'
);

// Filter state for department
content = content.replace(
  'const [filterPositionId, setFilterPositionId] = useState("all");',
  'const [filterPositionId, setFilterPositionId] = useState("all");\n  const [filterDepartmentId, setFilterDepartmentId] = useState("all");'
);

// Form state for department
content = content.replace(
  'const [positionId, setPositionId] = useState("unassigned");',
  'const [positionId, setPositionId] = useState("unassigned");\n  const [departmentId, setDepartmentId] = useState("unassigned");\n  const [openDept, setOpenDept] = useState(false);'
);

// Reset form
content = content.replace(
  'setPositionId("unassigned");',
  'setPositionId("unassigned");\n      setDepartmentId("unassigned");'
);

// Edit set
content = content.replace(
  'setPositionId(emp.positionId || "unassigned");',
  'setPositionId(emp.positionId || "unassigned");\n      setDepartmentId(emp.departmentId || "unassigned");'
);

// Handle save payload
content = content.replace(
  'employeeTypeId: employeeTypeId === "unassigned" ? null : employeeTypeId,',
  'employeeTypeId: employeeTypeId === "unassigned" ? null : employeeTypeId,\n      departmentId: departmentId === "unassigned" ? null : departmentId,'
);

// Apply filter logic
content = content.replace(
  'const matchPos = filterPositionId === "all" || emp.positionId === filterPositionId;',
  'const matchPos = filterPositionId === "all" || emp.positionId === filterPositionId;\n    const matchDept = filterDepartmentId === "all" || emp.departmentId === filterDepartmentId;'
);
content = content.replace(
  'return matchSearch && matchPos && matchType && matchStatus;',
  'return matchSearch && matchPos && matchType && matchStatus && matchDept;'
);

// Apply sorting logic
content = content.replace(
  '} else if (sortConfig.key === \'name\') {',
  `} else if (sortConfig.key === 'departmentName') {
          aValue = a.department?.name || '';
          bValue = b.department?.name || '';
        } else if (sortConfig.key === 'name') {`
);

// Excel export
content = content.replace(
  "'นามสกุล': emp.lastName,",
  "'นามสกุล': emp.lastName,\n      'แผนก': emp.department?.name || '',"
);

// UI Filter
const filterDeptHTML = `
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">แผนก:</Label>
              <select className="h-9 border rounded px-2 text-sm bg-gray-50" value={filterDepartmentId} onChange={e => setFilterDepartmentId(e.target.value)}>
                 <option value="all">ทั้งหมด (All)</option>
                 {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
`;
content = content.replace(
  '<div className="flex items-center gap-2">\n              <Label className="text-sm font-semibold whitespace-nowrap">ตำแหน่ง:</Label>',
  filterDeptHTML + '<div className="flex items-center gap-2">\n              <Label className="text-sm font-semibold whitespace-nowrap">ตำแหน่ง:</Label>'
);

// Table Header
content = content.replace(
  '<TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort(\'name\')}>\n                  ชื่อ - นามสกุล {renderSortIcon(\'name\')}\n                </TableHead>',
  '<TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort(\'name\')}>\n                  ชื่อ - นามสกุล {renderSortIcon(\'name\')}\n                </TableHead>\n                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort(\'departmentName\')}>\n                  แผนก {renderSortIcon(\'departmentName\')}\n                </TableHead>'
);

// Table Cell
content = content.replace(
  '<TableCell>{emp.firstName} {emp.lastName}</TableCell>',
  '<TableCell>{emp.firstName} {emp.lastName}</TableCell>\n                  <TableCell className="text-gray-600">\n                    {emp.department?.name || "-"}\n                  </TableCell>'
);

// ColSpan fixing
content = content.replace(/colSpan={7}/g, 'colSpan={8}');

// Dialog Form Select
const formDeptHTML = `
            <div className="space-y-2">
              <Label>แผนก</Label>
              <Popover open={openDept} onOpenChange={setOpenDept}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={openDept} className="w-full justify-between">
                    {departmentId === "unassigned" ? "ไม่ระบุ" : departments.find(d => d.id === departmentId)?.name || "เลือกแผนก..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[340px] p-0" style={{ zIndex: 99999 }}>
                  <Command>
                    <CommandInput placeholder="ค้นหาแผนก..." />
                    <CommandList>
                      <CommandEmpty>ไม่พบแผนก</CommandEmpty>
                      <CommandGroup>
                        <CommandItem onSelect={() => { setDepartmentId("unassigned"); setOpenDept(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", departmentId === "unassigned" ? "opacity-100" : "opacity-0")} />
                          ไม่ระบุ
                        </CommandItem>
                        {departments.map(dept => (
                          <CommandItem key={dept.id} onSelect={() => { setDepartmentId(dept.id); setOpenDept(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", departmentId === dept.id ? "opacity-100" : "opacity-0")} />
                            {dept.name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
`;
content = content.replace(
  '<div className="space-y-2">\n              <Label>ตำแหน่ง</Label>',
  formDeptHTML + '<div className="space-y-2">\n              <Label>ตำแหน่ง</Label>'
);

fs.writeFileSync(file, content);
console.log('Updated employees UI for departments');
