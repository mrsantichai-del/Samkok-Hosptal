const fs = require('fs');

const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import xlsx and Download icon
if (!content.includes('import * as XLSX')) {
  content = content.replace(
    'import axios from "axios";',
    'import axios from "axios";\nimport * as XLSX from "xlsx";'
  );
}

if (!content.includes('Download,')) {
  content = content.replace(
    'Search, Plus, Edit, Trash2, Check, ChevronsUpDown',
    'Search, Plus, Edit, Trash2, Check, ChevronsUpDown, Download, Upload'
  );
}

// 2. Add new states for Import/Export Diff
const stateInjection = `  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  
  // Excel Sync States
  const [diffData, setDiffData] = useState<any[]>([]);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
`;
content = content.replace(/  const \[saving, setSaving\] = useState\(false\);\s+const \[deleteItem, setDeleteItem\] = useState<any>\(null\);/, stateInjection);
// ensure React is available for useRef (it is imported as import { useEffect, useState, useRef } ... wait, let's check if useRef is imported)
if (!content.includes('useRef')) {
    content = content.replace('useEffect, useState', 'useEffect, useState, useRef');
}
content = content.replace('React.useRef', 'useRef');


// 3. Add Export and Import logic
const syncLogic = `
  const handleExportExcel = () => {
    const data = filteredEmployees.map(emp => ({
      'รหัสพนักงาน': emp.employeeCode,
      'ชื่อ': emp.firstName,
      'นามสกุล': emp.lastName,
      'ตำแหน่ง': emp.position?.name || '',
      'ประเภทพนักงาน': emp.employeeType?.name || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "Employees_Export.xlsx");
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        processExcelData(data);
      } catch (err) {
        toast.error("ไม่สามารถอ่านไฟล์ Excel ได้");
      }
      // reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

  const processExcelData = (excelRows: any[]) => {
    const changes: any[] = [];
    
    for (const row of excelRows) {
      const code = row['รหัสพนักงาน'];
      if (!code) continue;
      
      const emp = employees.find(e => e.employeeCode === code);
      if (!emp) continue; // Skip new employees for now (bulk update only)
      
      // Find IDs from names
      const posName = row['ตำแหน่ง'] || '';
      const typeName = row['ประเภทพนักงาน'] || '';
      
      const newPos = positions.find(p => p.name === posName);
      const newType = employeeTypes.find(t => t.name === typeName);
      
      const posId = newPos ? newPos.id : null;
      const typeId = newType ? newType.id : null;
      
      const isFirstNameChanged = emp.firstName !== (row['ชื่อ'] || '');
      const isLastNameChanged = emp.lastName !== (row['นามสกุล'] || '');
      const isPosChanged = (emp.positionId || null) !== posId;
      const isTypeChanged = (emp.employeeTypeId || null) !== typeId;
      
      if (isFirstNameChanged || isLastNameChanged || isPosChanged || isTypeChanged) {
        changes.push({
          empId: emp.id,
          employeeCode: emp.employeeCode,
          old: {
            firstName: emp.firstName,
            lastName: emp.lastName,
            positionName: emp.position?.name || '-',
            typeName: emp.employeeType?.name || '-'
          },
          new: {
            firstName: row['ชื่อ'] || '',
            lastName: row['นามสกุล'] || '',
            positionName: posName || '-',
            typeName: typeName || '-',
            positionId: posId,
            employeeTypeId: typeId
          }
        });
      }
    }
    
    if (changes.length > 0) {
      setDiffData(changes);
      setIsDiffOpen(true);
    } else {
      toast.info("ไม่มีข้อมูลเปลี่ยนแปลงจากไฟล์ที่อัปโหลด");
    }
  };

  const confirmBulkUpdate = async () => {
    setIsSyncing(true);
    const toastId = toast.loading("กำลังอัปเดตข้อมูล...");
    try {
      const token = Cookies.get("token");
      
      // Execute all patch requests concurrently
      await Promise.all(diffData.map(change => {
        return axios.patch(\`\${API_URL}/employees/\${change.empId}\`, {
          firstName: change.new.firstName,
          lastName: change.new.lastName,
          positionId: change.new.positionId,
          employeeTypeId: change.new.employeeTypeId
        }, { headers: { Authorization: \`Bearer \${token}\` } });
      }));
      
      toast.success("อัปเดตข้อมูลสำเร็จ", { id: toastId });
      setIsDiffOpen(false);
      setDiffData([]);
      fetchEmployees();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดต", { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };
`;
content = content.replace('  const fetchEmployees = async () => {', syncLogic + '\n  const fetchEmployees = async () => {');


// 4. Add Buttons to UI Header
const headerOriginal = `<Button className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> เพิ่มพนักงานใหม่
        </Button>`;
const headerUpdated = `<div className="flex gap-2">
          <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" /> ส่งออก Excel
          </Button>
          <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> นำเข้า Excel (อัปเดต)
          </Button>
          <Button className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> เพิ่มพนักงานใหม่
          </Button>
        </div>`;
content = content.replace(headerOriginal, headerUpdated);


// 5. Add Diff Dialog at the end
const diffDialog = `
      {/* Diff Dialog for Excel Sync */}
      <Dialog open={isDiffOpen} onOpenChange={setIsDiffOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>ยืนยันการอัปเดตข้อมูล ({diffData.length} รายการ)</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสพนักงาน</TableHead>
                  <TableHead>ข้อมูลเดิม</TableHead>
                  <TableHead>ข้อมูลใหม่</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diffData.map((d, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium whitespace-nowrap">{d.employeeCode}</TableCell>
                    <TableCell className="text-xs text-gray-500">
                      <div>ชื่อ: {d.old.firstName} {d.old.lastName}</div>
                      <div>ต/น: {d.old.positionName}</div>
                      <div>ป/ภ: {d.old.typeName}</div>
                    </TableCell>
                    <TableCell className="text-xs text-blue-700 bg-blue-50/50">
                      <div>ชื่อ: <span className={d.old.firstName !== d.new.firstName || d.old.lastName !== d.new.lastName ? "font-bold text-blue-600" : ""}>{d.new.firstName} {d.new.lastName}</span></div>
                      <div>ต/น: <span className={d.old.positionName !== d.new.positionName ? "font-bold text-blue-600" : ""}>{d.new.positionName}</span></div>
                      <div>ป/ภ: <span className={d.old.typeName !== d.new.typeName ? "font-bold text-blue-600" : ""}>{d.new.typeName}</span></div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDiffOpen(false)}>ยกเลิก</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={confirmBulkUpdate} disabled={isSyncing}>
              {isSyncing ? "กำลังอัปเดต..." : "ยืนยันการอัปเดต"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
`;

const lastDivIndex = content.lastIndexOf('</div>');
if (lastDivIndex !== -1) {
  content = content.substring(0, lastDivIndex) + diffDialog + content.substring(lastDivIndex);
}

fs.writeFileSync(file, content);
