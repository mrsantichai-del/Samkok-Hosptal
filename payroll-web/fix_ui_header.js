const fs = require('fs');
let file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The block to replace
const headerTargetStart = '<div className="flex justify-between items-center mb-2 flex-shrink-0">';
const headerTargetEnd = '<div className="flex gap-4 mb-2 items-center text-sm flex-shrink-0 bg-white p-2 rounded-md shadow-sm border">';

const headerReplacement = `<div className="flex justify-between items-center mb-2 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/payroll')} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">รายละเอียดการจ่ายเงินเดือน</h1>
            </div>
            {renderStatusBadge && renderStatusBadge()}
          </div>
          <div className="flex gap-2 items-center">
            {record?.status === 'DRAFT' && (
              <>
                <Button 
                  className={\`h-8 text-xs \${modifiedRows.size > 0 ? 'bg-[#1877f2] hover:bg-[#166fe5] animate-pulse' : 'bg-gray-400'} text-white\`} 
                  onClick={handleSaveAll}
                  disabled={modifiedRows.size === 0 || savingGlobal}
                >
                  <Save className="mr-1 h-3 w-3" /> 
                  {savingGlobal ? "บันทึก..." : \`บันทึกทั้งหมด (\${modifiedRows.size})\`}
                </Button>
                <Button className="h-8 text-xs bg-[#1877f2] hover:bg-[#166fe5] text-white" onClick={handleRequestApproval}>
                  ส่งขออนุมัติ
                </Button>
              </>
            )}
            {record?.status === 'PENDING_APPROVAL' && user?.roles?.includes('Executive') && (
              <Button className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove}>
                อนุมัติเงินเดือน
              </Button>
            )}
            {record?.status === 'APPROVED' && (
              <Button variant="outline" className="h-8 text-xs border-orange-300 text-orange-600" onClick={handleRequestEdit}>
                ขอแก้ไขข้อมูล
              </Button>
            )}
            {record?.status === 'EDIT_REQUESTED' && user?.roles?.includes('Executive') && (
              <div className="flex items-center gap-2 bg-orange-50 px-2 py-1 rounded">
                <span className="text-xs text-orange-600 truncate max-w-[200px]" title={record.editRequestReason}>เหตุผล: {record.editRequestReason}</span>
                <Button className="h-8 text-xs bg-orange-500 hover:bg-orange-600 text-white" onClick={handleGrantEdit}>
                  อนุญาตให้แก้ไข
                </Button>
              </div>
            )}
            
            {handleViewHistory && (
              <Button variant="outline" className="h-8 text-xs border-blue-300 text-blue-600 hover:bg-blue-50" onClick={handleViewHistory}>
                <Clock className="mr-1 h-3 w-3" /> ประวัติการแก้ไข
              </Button>
            )}

            <div className="w-px h-8 bg-gray-300 mx-1"></div>
            <Button className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={handleExportPdf} disabled={isExportingPdf}>
              <Download className="mr-1 h-3 w-3" /> {isExportingPdf ? "กำลังสร้าง PDF..." : "สลิป (PDF)"}
            </Button>
            <Button className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={handleExportExcel} disabled={isExportingExcel}>
              <Download className="mr-1 h-3 w-3" /> {isExportingExcel ? "กำลังส่งออก..." : "Export Excel"}
            </Button>
          </div>
        </div>
        
        <div className="flex gap-4 mb-2 items-center text-sm flex-shrink-0 bg-white p-2 rounded-md shadow-sm border">`;

let startIdx = content.indexOf(headerTargetStart);
let endIdx = content.indexOf(headerTargetEnd);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + headerReplacement + content.substring(endIdx + headerTargetEnd.length);
}

// Ensure deductionItems are readonly
content = content.replace(
  /<Input\s*type="number"\s*className="h-7 w-full text-right border-0 rounded-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-red-500 text-red-800 bg-transparent text-\[11px\] px-1"\s*value=\{gridData\[emp\.employeeId\]\?\.\[item\.id\] \|\| ''\}\s*onChange=\{\(e\) => \{\s*setGridData\(prev => \(\{\.\.\.prev, \[emp\.employeeId\]: \{\.\.\.\(prev\[emp\.employeeId\]\|\|\{\}\), \[item\.id\]: e\.target\.value\}\}\)\);\s*setModifiedRows\(prev => new Set\(prev\)\.add\(emp\.employeeId\)\);\s*\}\}/g,
  `<Input 
                                 type="number"
                                 readOnly={record?.status !== "DRAFT"}
                                 className="h-7 w-full text-right border-0 rounded-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-red-500 text-red-800 bg-transparent text-[11px] px-1"
                                 value={gridData[emp.employeeId]?.[item.id] || ''}
                                 onChange={(e) => {
                                   if (record?.status !== "DRAFT") return;
                                   setGridData(prev => ({...prev, [emp.employeeId]: {...(prev[emp.employeeId]||{}), [item.id]: e.target.value}}));
                                   setModifiedRows(prev => new Set(prev).add(emp.employeeId));
                                 }}`
);

// Fix incomeItems onChange
content = content.replace(
  /onChange=\{\(e\) => \{\s*setGridData\(prev => \(\{\.\.\.prev, \[emp\.employeeId\]: \{\.\.\.\(prev\[emp\.employeeId\]\|\|\{\}\), \[item\.id\]: e\.target\.value\}\}\)\);\s*setModifiedRows\(prev => new Set\(prev\)\.add\(emp\.employeeId\)\);\s*\}\}/g,
  `onChange={(e) => {
                                   if (record?.status !== "DRAFT") return;
                                   setGridData(prev => ({...prev, [emp.employeeId]: {...(prev[emp.employeeId]||{}), [item.id]: e.target.value}}));
                                   setModifiedRows(prev => new Set(prev).add(emp.employeeId));
                                 }}`
);


fs.writeFileSync(file, content);
console.log('Fixed header and input controls');
