const fs = require('fs');

const pages = [
  { path: 'src/app/dashboard/positions/page.tsx', endpoint: '/employees/positions', nameProp: 'name' },
  { path: 'src/app/dashboard/employee-types/page.tsx', endpoint: '/employees/types', nameProp: 'name' },
  { path: 'src/app/dashboard/pay-items/page.tsx', endpoint: '/payroll/items', nameProp: 'name' },
  { path: 'src/app/dashboard/employees/page.tsx', endpoint: '/employees', nameProp: 'employeeCode' }
];

for (const page of pages) {
  let content = fs.readFileSync(page.path, 'utf8');

  // 1. Add state for deleteItem
  if (!content.includes('const [deleteItem, setDeleteItem]')) {
    content = content.replace(
      'const [saving, setSaving] = useState(false);',
      'const [saving, setSaving] = useState(false);\n  const [deleteItem, setDeleteItem] = useState<any>(null);'
    );
  }

  // 2. Replace handleDelete with confirmDelete and promptDelete
  // Employees page uses fetchEmployees, PayItems uses fetchPayItems, the others use fetchTypes
  const fetchMethodMatch = content.match(/fetch[A-Za-z]+\(\)/g);
  const fetchMethod = fetchMethodMatch ? fetchMethodMatch[0] : 'fetchData()'; // Get the first occurence (like fetchEmployees())

  const confirmDeleteLogic = `  const promptDelete = (item: any) => {
    setDeleteItem(item);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    setSaving(true);
    try {
      const token = Cookies.get("token");
      await axios.delete(\`\${API_URL}${page.endpoint}/\${deleteItem.id}\`, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      setDeleteItem(null);
      ${fetchMethod};
      toast.success("ลบข้อมูลสำเร็จ");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการลบ");
    } finally {
      setSaving(false);
    }
  };`;

  // Find the old handleDelete
  content = content.replace(/const handleDelete = async \([\s\S]*?catch \(e: any\) \{[\s\S]*?\}[\s\n\r]*\};/, confirmDeleteLogic);

  // 3. Update the button onClick to promptDelete(item)
  content = content.replace(/onClick=\{\(\) => handleDelete\(item\.id\)\}/g, 'onClick={() => promptDelete(item)}');

  // 4. Inject the Delete Dialog before the last </div>
  const deleteDialog = `
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">ยืนยันการลบข้อมูล</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-gray-600">
            คุณแน่ใจหรือไม่ที่จะลบ <span className="font-bold text-gray-900">{deleteItem?.${page.nameProp}}</span>?<br/>
            การกระทำนี้ไม่สามารถย้อนกลับได้
          </div>
          <DialogFooter className="sm:justify-between flex-row">
            <Button variant="outline" onClick={() => setDeleteItem(null)}>ยกเลิก</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete} disabled={saving}>
              {saving ? "กำลังลบ..." : "ยืนยันการลบ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>`;

  // Replace the last </div> with the dialog + </div>
  // Find the last occurrence of </div>
  const lastDivIndex = content.lastIndexOf('</div>');
  if (lastDivIndex !== -1) {
    content = content.substring(0, lastDivIndex) + deleteDialog + content.substring(lastDivIndex + 6);
  }

  fs.writeFileSync(page.path, content);
}
