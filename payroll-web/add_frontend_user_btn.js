const fs = require('fs');

const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add "ผู้ใช้งาน" header
content = content.replace(
  '<TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort(\'typeName\')}>\n                    ประเภทพนักงาน {renderSortIcon(\'typeName\')}\n                  </TableHead>',
  '<TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort(\'typeName\')}>\n                    ประเภทพนักงาน {renderSortIcon(\'typeName\')}\n                  </TableHead>\n                  <TableHead>ผู้ใช้งาน</TableHead>'
);

// 2. Add body cell and button logic
const bodyRegex = /<TableCell className="text-gray-600">\{emp\.typeName \|\| "-"\ \}<\/TableCell>/;
const newBodyCell = `<TableCell className="text-gray-600">{emp.typeName || "-"}</TableCell>
                    <TableCell>
                      {emp.user ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                          <Check className="h-3 w-3" /> สร้างแล้ว
                        </span>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs bg-white text-[#1877f2] border-[#1877f2] hover:bg-[#1877f2] hover:text-white"
                          onClick={() => handleCreateUser(emp)}
                          disabled={savingUser === emp.id}
                        >
                          {savingUser === emp.id ? "กำลังสร้าง..." : "สร้าง User"}
                        </Button>
                      )}
                    </TableCell>`;
content = content.replace(bodyRegex, newBodyCell);

// 3. Add handleCreateUser and state
const funcStr = `
  const [savingUser, setSavingUser] = useState<string | null>(null);

  const handleCreateUser = async (emp: any) => {
    setSavingUser(emp.id);
    try {
      const token = Cookies.get("token");
      await axios.post(\`\${API_URL}/employees/\${emp.id}/create-user\`, {}, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      toast.success(\`สร้างผู้ใช้งานให้ \${emp.firstName} สำเร็จ\`);
      fetchEmployees();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการสร้าง User");
    } finally {
      setSavingUser(null);
    }
  };
`;

if (!content.includes('handleCreateUser')) {
  content = content.replace(
    'const handleSort = (key: string) => {',
    funcStr + '\n  const handleSort = (key: string) => {'
  );
}

// 4. Also increase colSpan from 7 to 8 for the loading/empty states
content = content.replace(/colSpan=\{7\}/g, 'colSpan={8}');

fs.writeFileSync(file, content);
console.log('Added User column and create user button');
