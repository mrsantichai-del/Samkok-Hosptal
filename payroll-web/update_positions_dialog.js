const fs = require('fs');
const file = 'src/app/dashboard/positions/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Select imports
if (!content.includes('SelectContent')) {
  content = content.replace(
    'import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";',
    'import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";\nimport { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";'
  );
}

// 2. Add departments state
if (!content.includes('departments, setDepartments')) {
  content = content.replace(
    'const [types, setTypes] = useState<any[]>([]);',
    'const [types, setTypes] = useState<any[]>([]);\n  const [departments, setDepartments] = useState<any[]>([]);'
  );
}

// 3. Add departmentId form state
if (!content.includes('departmentId, setDepartmentId')) {
  content = content.replace(
    'const [description, setDescription] = useState("");',
    'const [description, setDescription] = useState("");\n    const [departmentId, setDepartmentId] = useState("unassigned");'
  );
}

// 4. Update fetchTypes to also fetch departments
content = content.replace(
  /const fetchTypes = async \(\) => \{[\s\S]*?try \{[\s\S]*?const res = await axios\.get\(\`\$\{API_URL\}\/employees\/positions\`[\s\S]*?setTypes\(res\.data\);[\s\S]*?\} catch \(e\) \{/,
  `const fetchTypes = async () => {
    try {
      const token = Cookies.get("token");
      const [posRes, deptRes] = await Promise.all([
        axios.get(\`\${API_URL}/employees/positions\`, { headers: { Authorization: \`Bearer \${token}\` } }),
        axios.get(\`\${API_URL}/employees/departments\`, { headers: { Authorization: \`Bearer \${token}\` } })
      ]);
      setTypes(posRes.data);
      setDepartments(deptRes.data);
    } catch (e) {`
);

// 5. Update openAddDialog
content = content.replace(
  /const openAddDialog = \(\) => \{[\s\S]*?setDescription\(""\);\s*setIsDialogOpen\(true\);\s*\};/,
  `const openAddDialog = () => {
    setEditingItem(null);
    setName("");
    setDescription("");
    setDepartmentId("unassigned");
    setIsDialogOpen(true);
  };`
);

// 6. Update openEditDialog
content = content.replace(
  /const openEditDialog = \(item: any\) => \{[\s\S]*?setDescription\(item\.description \|\| ""\);\s*setIsDialogOpen\(true\);\s*\};/,
  `const openEditDialog = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description || "");
    setDepartmentId(item.departmentId || "unassigned");
    setIsDialogOpen(true);
  };`
);

// 7. Update payload in handleSave
content = content.replace(
  /const payload = \{\s*name,\s*description: description === "" \? null : description\s*\};/,
  `const payload = {
        name,
        description: description === "" ? null : description,
        departmentId: departmentId === "unassigned" ? null : departmentId
      };`
);

// 8. Add Select input to the Dialog
const selectInput = `
              <div className="space-y-2">
                <Label htmlFor="department">กลุ่มงาน (ถ้ามี)</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกกลุ่มงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">ไม่ระบุ</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
`;
content = content.replace(
  /<div className="space-y-2">\s*<Label htmlFor="description">รายละเอียดเพิ่มเติม[\s\S]*?<\/div>/,
  match => match + selectInput
);

fs.writeFileSync(file, content);
console.log('Updated positions/page.tsx with department dropdown');
