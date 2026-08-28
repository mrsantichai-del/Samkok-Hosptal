const fs = require('fs');
const file = 'src/app/dashboard/payroll/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('import { Dialog, DialogContent', 'import { toast } from "sonner";\nimport { Dialog, DialogContent');

content = content.replace(
  'console.error(e);\n    } finally {',
  'console.error(e);\n      toast.error("ดึงข้อมูลไม่สำเร็จ");\n    } finally {'
);

content = content.replace(
  'const handleProcess = async () => {\n    if (!selectedMonth || !selectedYear) return;\n    setProcessing(true);\n    try {',
  'const handleProcess = async () => {\n    if (!selectedMonth || !selectedYear) return;\n    setProcessing(true);\n    const toastId = toast.loading("กำลังประมวลผลเงินเดือน...");\n    try {'
);
content = content.replace(
  'setIsDialogOpen(false);\n      fetchRecords();\n    } catch (e) {\n      console.error(e);\n    } finally {\n      setProcessing(false);\n    }',
  'setIsDialogOpen(false);\n      fetchRecords();\n      toast.success("ประมวลผลเรียบร้อยแล้ว", { id: toastId });\n    } catch (e: any) {\n      console.error(e);\n      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการประมวลผล", { id: toastId });\n    } finally {\n      setProcessing(false);\n    }'
);

content = content.replace(
  'const handleDelete = async (id: string) => {\n    if (!confirm("ยืนยันการลบรายการนี้?")) return;\n    try {',
  'const handleDelete = async (id: string) => {\n    if (!confirm("ยืนยันการลบรายการนี้?")) return;\n    const toastId = toast.loading("กำลังลบข้อมูล...");\n    try {'
);
content = content.replace(
  'await axios.delete(`${API_URL}/payroll/records/${id}`, { headers: { Authorization: `Bearer ${token}` } });\n      fetchRecords();\n    } catch (e) {\n      console.error(e);\n    }',
  'await axios.delete(`${API_URL}/payroll/records/${id}`, { headers: { Authorization: `Bearer ${token}` } });\n      fetchRecords();\n      toast.success("ลบข้อมูลเรียบร้อยแล้ว", { id: toastId });\n    } catch (e: any) {\n      console.error(e);\n      toast.error("เกิดข้อผิดพลาดในการลบ", { id: toastId });\n    }'
);

content = content.replace(
  '<Button onClick={handleProcess} disabled={processing}>เริ่มประมวลผล</Button>',
  '<Button onClick={handleProcess} disabled={processing}>{processing ? "กำลังประมวลผล..." : "เริ่มประมวลผล"}</Button>'
);

fs.writeFileSync(file, content);
