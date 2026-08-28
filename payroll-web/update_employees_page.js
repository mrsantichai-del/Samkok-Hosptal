const fs = require('fs');
const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace('import { Dialog, DialogContent', 'import { toast } from "sonner";\nimport { Dialog, DialogContent');

// fetchEmployees
content = content.replace(
  'console.error(e);\n    } finally {',
  'console.error(e);\n      toast.error("ดึงข้อมูลไม่สำเร็จ");\n    } finally {'
);

// handleSave
content = content.replace(
  'const handleSave = async () => {\n    if (!firstName || !lastName) return;\n    setSaving(true);\n    try {',
  'const handleSave = async () => {\n    if (!firstName || !lastName) return;\n    setSaving(true);\n    const toastId = toast.loading("กำลังบันทึกข้อมูล...");\n    try {'
);
content = content.replace(
  'setIsDialogOpen(false);\n      fetchEmployees();\n    } catch (e) {\n      console.error(e);\n    } finally {\n      setSaving(false);\n    }',
  'setIsDialogOpen(false);\n      fetchEmployees();\n      toast.success("บันทึกข้อมูลเรียบร้อยแล้ว", { id: toastId });\n    } catch (e: any) {\n      console.error(e);\n      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึก", { id: toastId });\n    } finally {\n      setSaving(false);\n    }'
);

// handleDelete
content = content.replace(
  'const handleDelete = async (id: string) => {\n    if (!confirm("ยืนยันการลบพนักงาน?")) return;\n    try {',
  'const handleDelete = async (id: string) => {\n    if (!confirm("ยืนยันการลบพนักงาน?")) return;\n    const toastId = toast.loading("กำลังลบข้อมูล...");\n    try {'
);
content = content.replace(
  'await axios.delete(`${API_URL}/employees/${id}`, { headers: { Authorization: `Bearer ${token}` } });\n      fetchEmployees();\n    } catch (e) {\n      console.error(e);\n    }',
  'await axios.delete(`${API_URL}/employees/${id}`, { headers: { Authorization: `Bearer ${token}` } });\n      fetchEmployees();\n      toast.success("ลบพนักงานเรียบร้อยแล้ว", { id: toastId });\n    } catch (e: any) {\n      console.error(e);\n      toast.error("เกิดข้อผิดพลาดในการลบพนักงาน", { id: toastId });\n    }'
);

// Buttons
content = content.replace(
  '<Button onClick={handleSave} disabled={saving}>บันทึก</Button>',
  '<Button onClick={handleSave} disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึก"}</Button>'
);

fs.writeFileSync(file, content);
