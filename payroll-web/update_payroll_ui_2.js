const fs = require('fs');
let file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 2. Add workflow actions
const workflowActions = `
  const handleRequestApproval = async () => {
    if (!confirm('ยืนยันการส่งขออนุมัติ? ระบบจะล็อกการแก้ไข')) return;
    try {
      const token = Cookies.get("token");
      await axios.patch(\`\${API_URL}/payroll/records/\${resolvedParams.id}/request-approval\`, {}, { headers: { Authorization: \`Bearer \${token}\` } });
      toast.success('ส่งคำขออนุมัติแล้ว');
      fetchData();
    } catch(e) { toast.error('Error'); }
  }

  const handleApprove = async () => {
    if (!confirm('ยืนยันการอนุมัติเงินเดือน?')) return;
    try {
      const token = Cookies.get("token");
      await axios.patch(\`\${API_URL}/payroll/records/\${resolvedParams.id}/approve\`, {}, { headers: { Authorization: \`Bearer \${token}\` } });
      toast.success('อนุมัติแล้ว');
      fetchData();
    } catch(e) { toast.error('Error'); }
  }

  const handleRequestEdit = async () => {
    const reason = prompt('ระบุเหตุผลในการขอแก้ไข:');
    if (!reason) return;
    try {
      const token = Cookies.get("token");
      await axios.patch(\`\${API_URL}/payroll/records/\${resolvedParams.id}/request-edit\`, { reason }, { headers: { Authorization: \`Bearer \${token}\` } });
      toast.success('ส่งคำขอแก้ไขแล้ว');
      fetchData();
    } catch(e) { toast.error('Error'); }
  }

  const handleGrantEdit = async () => {
    if (!confirm('อนุญาตให้แก้ไขเงินเดือนรอบนี้?')) return;
    try {
      const token = Cookies.get("token");
      await axios.patch(\`\${API_URL}/payroll/records/\${resolvedParams.id}/grant-edit\`, {}, { headers: { Authorization: \`Bearer \${token}\` } });
      toast.success('อนุญาตให้แก้ไขแล้ว');
      fetchData();
    } catch(e) { toast.error('Error'); }
  }

  const renderStatusBadge = () => {
    if (!record) return null;
    switch(record.status) {
      case 'DRAFT': return <Badge variant="outline" className="bg-gray-100 text-gray-800"><Edit className="w-3 h-3 mr-1"/> ฉบับร่าง</Badge>;
      case 'PENDING_APPROVAL': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1"/> รอการอนุมัติ</Badge>;
      case 'APPROVED': return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1"/> อนุมัติแล้ว</Badge>;
      case 'EDIT_REQUESTED': return <Badge variant="outline" className="bg-orange-100 text-orange-800"><AlertCircle className="w-3 h-3 mr-1"/> ขอแก้ไข</Badge>;
      default: return <Badge>{record.status}</Badge>;
    }
  }
`;
content = content.replace('const handleExportExcel = async () => {', workflowActions + '\n  const handleExportExcel = async () => {');

// 3. Update the Header buttons
const headerButtons = `
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 justify-end">
              {renderStatusBadge()}
            </div>
            <div className="flex items-center gap-2">
              {record?.status === 'DRAFT' && (
                <>
                  <Button variant="outline" className="border-gray-300 text-gray-700 bg-white" onClick={handleSaveAll} disabled={modifiedRows.size === 0 || savingGlobal}>
                    <Save className="mr-2 h-4 w-4" /> {savingGlobal ? "กำลังบันทึก..." : \`บันทึกทั้งหมด (\${modifiedRows.size})\`}
                  </Button>
                  <Button className="bg-[#1877f2] hover:bg-[#166fe5] text-white" onClick={handleRequestApproval}>
                    ส่งขออนุมัติ
                  </Button>
                </>
              )}
              {record?.status === 'PENDING_APPROVAL' && user?.roles?.includes('Executive') && (
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove}>
                  อนุมัติเงินเดือน
                </Button>
              )}
              {record?.status === 'APPROVED' && (
                <Button variant="outline" className="border-orange-300 text-orange-600" onClick={handleRequestEdit}>
                  ขอแก้ไขข้อมูล
                </Button>
              )}
              {record?.status === 'EDIT_REQUESTED' && user?.roles?.includes('Executive') && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-orange-600">เหตุผล: {record.editRequestReason}</span>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleGrantEdit}>
                    อนุญาตให้แก้ไข
                  </Button>
                </div>
              )}

              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" /> สลิป (PDF)
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleExportExcel} disabled={isExportingExcel}>
                <Download className="mr-2 h-4 w-4" /> {isExportingExcel ? "กำลังสร้าง..." : "Export Excel"}
              </Button>
              <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleImportExcel} />
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 bg-white" onClick={() => fileInputRef.current?.click()} disabled={isImportingExcel || record?.status !== 'DRAFT'}>
                <Upload className="mr-2 h-4 w-4" /> {isImportingExcel ? "กำลังนำเข้า..." : "นำเข้า Excel (Import)"}
              </Button>
            </div>
          </div>
`;

content = content.replace(
  /<Button variant="outline" className="border-gray-300 text-gray-700 bg-white" onClick=\{handleSaveAll\} disabled=\{modifiedRows\.size === 0 \|\| savingGlobal\}>\s*<Save className="mr-2 h-4 w-4" \/> \{savingGlobal \? "กำลังบันทึก\.\.\." : `บันทึกทั้งหมด \(\$\{modifiedRows\.size\}\)`\}\s*<\/Button>\s*<Button className="bg-red-600 hover:bg-red-700 text-white" onClick=\{handleExportPDF\}>\s*<Download className="mr-2 h-4 w-4" \/> สลิป \(PDF\)\s*<\/Button>\s*<Button className="bg-green-600 hover:bg-green-700 text-white" onClick=\{handleExportExcel\} disabled=\{isExportingExcel\}>\s*<Download className="mr-2 h-4 w-4" \/> \{isExportingExcel \? "กำลังสร้าง\.\.\." : "Export Excel"\}\s*<\/Button>\s*<input type="file" accept="\.xlsx, \.xls" className="hidden" ref=\{fileInputRef\} onChange=\{handleImportExcel\} \/>\s*<Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 bg-white" onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\} disabled=\{isImportingExcel\}>\s*<Upload className="mr-2 h-4 w-4" \/> \{isImportingExcel \? "กำลังนำเข้า\.\.\." : "นำเข้า Excel \(Import\)"\}\s*<\/Button>/,
  headerButtons
);

fs.writeFileSync(file, content);
console.log('Phase 2 of payroll detail update complete');
