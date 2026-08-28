const fs = require('fs');
const file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace('import { Dialog, DialogContent', 'import { toast } from "sonner";\nimport { Dialog, DialogContent');

// State
content = content.replace(
  'const [savingGlobal, setSavingGlobal] = useState(false);',
  'const [savingGlobal, setSavingGlobal] = useState(false);\n  const [isExportingExcel, setIsExportingExcel] = useState(false);\n  const [isExportingPdf, setIsExportingPdf] = useState(false);'
);

// fetchData
content = content.replace(
  'console.error(e);\n    } finally {',
  'console.error(e);\n      toast.error("ดึงข้อมูลไม่สำเร็จ");\n    } finally {'
);

// handleSaveAll
content = content.replace(
  'const handleSaveAll = async () => {\n    if (modifiedRows.size === 0) return;\n    setSavingGlobal(true);\n    try {',
  'const handleSaveAll = async () => {\n    if (modifiedRows.size === 0) return;\n    setSavingGlobal(true);\n    const toastId = toast.loading("กำลังบันทึกข้อมูล...");\n    try {'
);
content = content.replace(
  'setModifiedRows(new Set());\n      alert("บันทึกข้อมูลเรียบร้อยแล้ว");',
  'setModifiedRows(new Set());\n      toast.success("บันทึกข้อมูลเรียบร้อยแล้ว", { id: toastId });'
);
content = content.replace(
  'alert("เกิดข้อผิดพลาดในการบันทึก");\n    } finally {',
  'toast.error("เกิดข้อผิดพลาดในการบันทึก", { id: toastId });\n    } finally {'
);

// handleExportExcel
content = content.replace(
  'const handleExportExcel = async () => {\n    try {',
  'const handleExportExcel = async () => {\n    setIsExportingExcel(true);\n    const toastId = toast.loading("กำลังสร้างไฟล์ Excel...");\n    try {'
);
content = content.replace(
  'link.click();\n    } catch (e: any) { alert(`ไม่สามารถดาวน์โหลดไฟล์ Excel ได้: ${e.response?.data?.message || e.message}`); }\n  };',
  'link.click();\n      toast.success("ดาวน์โหลดไฟล์ Excel สำเร็จ", { id: toastId });\n    } catch (e: any) {\n      toast.error(`ไม่สามารถดาวน์โหลดไฟล์ Excel ได้: ${e.response?.data?.message || e.message}`, { id: toastId });\n    } finally {\n      setIsExportingExcel(false);\n    }\n  };'
);

// handleExportPdf
content = content.replace(
  'const handleExportPdf = async () => {\n    try {',
  'const handleExportPdf = async () => {\n    setIsExportingPdf(true);\n    const toastId = toast.loading("กำลังสร้างสลิปเงินเดือน (PDF)...");\n    try {'
);
content = content.replace(
  'window.open(url);\n    } catch (e: any) { alert(`ไม่สามารถดาวน์โหลดไฟล์ PDF ได้: ${e.response?.data?.message || e.message}`); }\n  };',
  'window.open(url);\n      toast.success("สร้างสลิปเงินเดือนสำเร็จ", { id: toastId });\n    } catch (e: any) {\n      toast.error(`ไม่สามารถดาวน์โหลดไฟล์ PDF ได้: ${e.response?.data?.message || e.message}`, { id: toastId });\n    } finally {\n      setIsExportingPdf(false);\n    }\n  };'
);

// confirmImport
content = content.replace(
  'setPendingGridData(null);\n  };',
  'setPendingGridData(null);\n    toast.success("นำเข้าตัวเลขสำเร็จ! อย่าลืมกด บันทึกทั้งหมด เพื่อยืนยัน");\n  };'
);
content = content.replace(
  'alert("เกิดข้อผิดพลาดในการอ่านไฟล์: " + err.message);',
  'toast.error("เกิดข้อผิดพลาดในการอ่านไฟล์: " + err.message);'
);

// Buttons
content = content.replace(
  '<Button className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={handleExportPdf}>',
  '<Button className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={handleExportPdf} disabled={isExportingPdf}>'
);
content = content.replace(
  '<Download className="mr-1 h-3 w-3" /> สลิป (PDF)',
  '<Download className="mr-1 h-3 w-3" /> {isExportingPdf ? "กำลังสร้าง PDF..." : "สลิป (PDF)"}'
);

content = content.replace(
  '<Button className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={handleExportExcel}>',
  '<Button className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={handleExportExcel} disabled={isExportingExcel}>'
);
content = content.replace(
  '<Download className="mr-1 h-3 w-3" /> Export Excel',
  '<Download className="mr-1 h-3 w-3" /> {isExportingExcel ? "กำลังส่งออก..." : "Export Excel"}'
);

fs.writeFileSync(file, content);
