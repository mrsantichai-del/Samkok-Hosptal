const fs = require('fs');
const file = 'src/app/dashboard/employee-types/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('import { Dialog, DialogContent', 'import { toast } from "sonner";\nimport { Dialog, DialogContent');

content = content.replace(
  'console.error(e);\n    } finally {',
  'console.error(e);\n      toast.error("ดึงข้อมูลไม่สำเร็จ");\n    } finally {'
);

content = content.replace(
  'const handleSave = async () => {\n    if (!name) return;\n    setSaving(true);\n    try {',
  'const handleSave = async () => {\n    if (!name) return;\n    setSaving(true);\n    const toastId = toast.loading("กำลังบันทึกข้อมูล...");\n    try {'
);
content = content.replace(
  'setIsDialogOpen(false);\n      fetchTypes();\n    } catch (e) {\n      console.error(e);\n    } finally {\n      setSaving(false);\n    }',
  'setIsDialogOpen(false);\n      fetchTypes();\n      toast.success("บันทึกข้อมูลเรียบร้อยแล้ว", { id: toastId });\n    } catch (e: any) {\n      console.error(e);\n      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึก", { id: toastId });\n    } finally {\n      setSaving(false);\n    }'
);

content = content.replace(
  'const handleDelete = async (id: string) => {\n    if (!confirm("ยืนยันการลบประเภทพนักงาน?")) return;\n    try {',
  'const handleDelete = async (id: string) => {\n    if (!confirm("ยืนยันการลบประเภทพนักงาน?")) return;\n    const toastId = toast.loading("กำลังลบข้อมูล...");\n    try {'
);
content = content.replace(
  'await axios.delete(`${API_URL}/employees/types/${id}`, { headers: { Authorization: `Bearer ${token}` } });\n      fetchTypes();\n    } catch (e) {\n      console.error(e);\n    }',
  'await axios.delete(`${API_URL}/employees/types/${id}`, { headers: { Authorization: `Bearer ${token}` } });\n      fetchTypes();\n      toast.success("ลบข้อมูลเรียบร้อยแล้ว", { id: toastId });\n    } catch (e: any) {\n      console.error(e);\n      toast.error("เกิดข้อผิดพลาดในการลบ", { id: toastId });\n    }'
);

content = content.replace(
  '<Button onClick={handleSave} disabled={saving}>บันทึก</Button>',
  '<Button onClick={handleSave} disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึก"}</Button>'
);

fs.writeFileSync(file, content);
