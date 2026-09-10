const fs = require('fs');
let file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Eye icon
content = content.replace(
  /import \{ (.*?) \} from "lucide-react";/,
  'import { $1, Eye } from "lucide-react";'
);

// 2. Add viewingEmp state
content = content.replace(
  'const fileInputRef = useRef<HTMLInputElement>(null);',
  'const fileInputRef = useRef<HTMLInputElement>(null);\n  const [viewingEmp, setViewingEmp] = useState<any>(null);'
);

// 3. Modify "รับสุทธิ" TableHead
content = content.replace(
  /<TableHead rowSpan=\{2\} className="border border-gray-300 p-1 text-center sticky right-0 top-0 z-50 bg-gray-200 min-w-\[100px\] w-\[100px\] shadow-\[-1px_0_0_0_#d1d5db\] font-bold">รับสุทธิ<\/TableHead>/,
  '<TableHead rowSpan={2} className="border border-gray-300 p-1 text-center sticky right-[60px] top-0 z-50 bg-gray-200 min-w-[100px] w-[100px] font-bold">รับสุทธิ</TableHead>\n                    <TableHead rowSpan={2} className="border border-gray-300 p-1 text-center sticky right-0 top-0 z-50 bg-gray-200 min-w-[60px] w-[60px] shadow-[-1px_0_0_0_#d1d5db] font-bold">จัดการ</TableHead>'
);

// 4. Modify "รับสุทธิ" TableCell
content = content.replace(
  /<TableCell className="border border-gray-300 p-1 text-right font-bold text-gray-900 sticky right-0 z-10 bg-gray-100 group-hover:bg-gray-200 shadow-\[-1px_0_0_0_#e5e7eb\] text-\[11px\] min-w-\[100px\] w-\[100px\]">/g,
  '<TableCell className="border border-gray-300 p-1 text-right font-bold text-gray-900 sticky right-[60px] z-10 bg-gray-100 group-hover:bg-gray-200 text-[11px] min-w-[100px] w-[100px]">'
);

// 5. Add new Action TableCell after the net TableCell
content = content.replace(
  /\{net\.toLocaleString\(undefined, \{minimumFractionDigits: 2, maximumFractionDigits: 2\}\)\}\n                           <\/TableCell>\n                         <\/TableRow>/g,
  '{net.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n                           </TableCell>\n                           <TableCell className="border border-gray-300 p-1 text-center sticky right-0 z-10 bg-gray-100 group-hover:bg-gray-200 shadow-[-1px_0_0_0_#e5e7eb] w-[60px]">\n                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setViewingEmp(emp)}>\n                               <Eye className="h-4 w-4 text-blue-600" />\n                             </Button>\n                           </TableCell>\n                         </TableRow>'
);

// 6. Modify TableFooter "รับสุทธิ" cell and add empty footer cell
content = content.replace(
  /<TableCell className="border border-gray-300 p-1 text-right font-bold text-gray-900 bg-gray-300 sticky right-0 z-50 min-w-\[100px\] w-\[100px\] shadow-\[-1px_0_0_0_#d1d5db\]">/g,
  '<TableCell className="border border-gray-300 p-1 text-right font-bold text-gray-900 bg-gray-300 sticky right-[60px] z-50 min-w-[100px] w-[100px]">'
);

content = content.replace(
  /\{computeNetTotal\(\)\.toLocaleString\(undefined, \{minimumFractionDigits:2, maximumFractionDigits:2\}\)\}\n                     <\/TableCell>\n                   <\/TableRow>\n                <\/TableFooter>/g,
  '{computeNetTotal().toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}\n                     </TableCell>\n                     <TableCell className="border border-gray-300 bg-gray-300 sticky right-0 z-50 min-w-[60px] w-[60px] shadow-[-1px_0_0_0_#d1d5db]"></TableCell>\n                   </TableRow>\n                </TableFooter>'
);

// 7. Add EmployeeDetailsModal at the end of the file before final closing tag
const modalJSX = `
      {viewingEmp && (
        <Dialog open={!!viewingEmp} onOpenChange={(open) => !open && setViewingEmp(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-4 border-b bg-gray-50 flex-shrink-0">
              <DialogTitle className="text-lg flex justify-between items-center">
                <span>รายละเอียดเงินเดือน: {viewingEmp.firstName} {viewingEmp.lastName}</span>
              </DialogTitle>
              <DialogDescription>
                รหัส: {viewingEmp.employeeCode} | ตำแหน่ง: {viewingEmp.position?.name || '-'} | ประเภท: {viewingEmp.employeeType?.name || '-'}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-700 mb-3 border-b border-green-200 pb-2">รายรับ (+)</h3>
                  <div className="space-y-2">
                    {incomeItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <Label className="text-xs text-gray-600 truncate mr-2" title={item.name}>{item.name}</Label>
                        <Input 
                          type="number" 
                          className="h-8 w-32 text-right text-xs focus-visible:ring-green-500"
                          value={gridData[viewingEmp.employeeId]?.[item.id] || ''}
                          onChange={(e) => {
                            setGridData(prev => ({...prev, [viewingEmp.employeeId]: {...(prev[viewingEmp.employeeId]||{}), [item.id]: e.target.value}}));
                            setModifiedRows(prev => new Set(prev).add(viewingEmp.employeeId));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-red-700 mb-3 border-b border-red-200 pb-2">รายจ่ายและภาษี (-)</h3>
                  <div className="space-y-2">
                    {deductionItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <Label className="text-xs text-gray-600 truncate mr-2" title={item.name}>{item.name}</Label>
                        <Input 
                          type="number" 
                          className="h-8 w-32 text-right text-xs focus-visible:ring-red-500"
                          value={gridData[viewingEmp.employeeId]?.[item.id] || ''}
                          onChange={(e) => {
                            setGridData(prev => ({...prev, [viewingEmp.employeeId]: {...(prev[viewingEmp.employeeId]||{}), [item.id]: e.target.value}}));
                            setModifiedRows(prev => new Set(prev).add(viewingEmp.employeeId));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-100 flex-shrink-0">
              <div className="flex justify-between items-center mb-4 text-sm">
                <div className="flex gap-6">
                  <div className="text-green-700">รวมรายรับ: <span className="font-bold">{incomeItems.reduce((sum, item) => sum + Number(gridData[viewingEmp.employeeId]?.[item.id] || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                  <div className="text-red-700">รวมรายจ่าย: <span className="font-bold">{deductionItems.reduce((sum, item) => sum + Number(gridData[viewingEmp.employeeId]?.[item.id] || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  รับสุทธิ: {(
                    incomeItems.reduce((sum, item) => sum + Number(gridData[viewingEmp.employeeId]?.[item.id] || 0), 0) -
                    deductionItems.reduce((sum, item) => sum + Number(gridData[viewingEmp.employeeId]?.[item.id] || 0), 0)
                  ).toLocaleString(undefined, {minimumFractionDigits: 2})} บาท
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setViewingEmp(null)} className="bg-[#1877f2] hover:bg-[#166fe5]">เสร็จสิ้น</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
`;

content = content.replace(/    <\/div>\n  \);\n\}\n?$/, modalJSX);

fs.writeFileSync(file, content);
console.log('Added Individual Edit Modal!');
