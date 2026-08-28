const fs = require('fs');
const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const [employeeTypes, setEmployeeTypes] = useState<any[]>([]);',
  'const [employeeTypes, setEmployeeTypes] = useState<any[]>([]);\n  const [positions, setPositions] = useState<any[]>([]);'
);

content = content.replace(
  'const [employeeTypeId, setEmployeeTypeId] = useState("unassigned");',
  'const [employeeTypeId, setEmployeeTypeId] = useState("unassigned");\n  const [positionId, setPositionId] = useState("unassigned");'
);

content = content.replace(
  'axios.get(`${API_URL}/employees/types`, { headers: { Authorization: `Bearer ${token}` } })',
  'axios.get(`${API_URL}/employees/types`, { headers: { Authorization: `Bearer ${token}` } }),\n        axios.get(`${API_URL}/employees/positions`, { headers: { Authorization: `Bearer ${token}` } })'
);

content = content.replace(
  'const [empRes, typeRes] = await Promise.all([',
  'const [empRes, typeRes, posRes] = await Promise.all(['
);

content = content.replace(
  'setEmployeeTypes(typeRes.data);',
  'setEmployeeTypes(typeRes.data);\n      setPositions(posRes.data);'
);

content = content.replace(
  'setEmployeeTypeId("unassigned");\n    setIsDialogOpen(true);',
  'setEmployeeTypeId("unassigned");\n    setPositionId("unassigned");\n    setIsDialogOpen(true);'
);

content = content.replace(
  'setEmployeeTypeId(item.employeeTypeId || "unassigned");\n    setIsDialogOpen(true);',
  'setEmployeeTypeId(item.employeeTypeId || "unassigned");\n    setPositionId(item.positionId || "unassigned");\n    setIsDialogOpen(true);'
);

content = content.replace(
  'employeeTypeId: employeeTypeId === "unassigned" ? null : employeeTypeId',
  'employeeTypeId: employeeTypeId === "unassigned" ? null : employeeTypeId,\n        positionId: positionId === "unassigned" ? null : positionId'
);

content = content.replace(
  '<TableHead>ประเภทพนักงาน</TableHead>',
  '<TableHead>ตำแหน่ง</TableHead>\n                <TableHead>ประเภทพนักงาน</TableHead>'
);

content = content.replace(
  '<TableCell>\n                  {emp.employeeType?.name ? (',
  '<TableCell>\n                  {emp.position?.name ? (\n                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">\n                      {emp.position.name}\n                    </span>\n                  ) : "-"}\n                  </TableCell>\n                  <TableCell>\n                  {emp.employeeType?.name ? ('
);

content = content.replace(
  '<div className="space-y-2">\n              <Label>ประเภทพนักงาน</Label>',
  '<div className="space-y-2">\n              <Label>ตำแหน่ง</Label>\n              <Select value={positionId} onValueChange={setPositionId}>\n                <SelectTrigger>\n                  <SelectValue placeholder="เลือกตำแหน่ง" />\n                </SelectTrigger>\n                <SelectContent>\n                  <SelectItem value="unassigned">ไม่ระบุ</SelectItem>\n                  {positions.map(pos => (\n                    <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>\n                  ))}\n                </SelectContent>\n              </Select>\n            </div>\n\n            <div className="space-y-2">\n              <Label>ประเภทพนักงาน</Label>'
);

fs.writeFileSync(file, content);
