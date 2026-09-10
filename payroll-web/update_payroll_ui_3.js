const fs = require('fs');
let file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const historyLogic = `
  const [historyOpen, setHistoryOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const handleViewHistory = async () => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get(\`\${API_URL}/payroll/records/\${resolvedParams.id}/audit-logs\`, { headers: { Authorization: \`Bearer \${token}\` } });
      setAuditLogs(res.data);
      setHistoryOpen(true);
    } catch(e) { toast.error('Error fetching history'); }
  };
`;

content = content.replace('const [record, setRecord] = useState<any>(null);', 'const [record, setRecord] = useState<any>(null);\n' + historyLogic);

const historyButton = `
              <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50" onClick={handleViewHistory}>
                ดูประวัติการแก้ไข
              </Button>
`;

content = content.replace('<div className="flex flex-col gap-2">\n            <div className="flex items-center gap-4 justify-end">\n              {renderStatusBadge()}\n            </div>\n            <div className="flex items-center gap-2">', '<div className="flex flex-col gap-2">\n            <div className="flex items-center gap-4 justify-end">\n              {historyButton}\n              {renderStatusBadge()}\n            </div>\n            <div className="flex items-center gap-2">');

const historyModal = `
        {/* History Modal */}
        <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>ประวัติการแก้ไขเงินเดือน</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {auditLogs.length === 0 ? (
                <div className="text-center text-gray-500">ยังไม่มีประวัติการแก้ไข</div>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="p-4 border rounded-md bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm">
                        {log.action}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString('th-TH')}
                      </span>
                    </div>
                    <div className="text-sm">ผู้กระทำ: {log.user?.employee?.firstName ? \`\${log.user.employee.firstName} \${log.user.employee.lastName}\` : log.user?.username || 'System'}</div>
                    {log.reason && <div className="text-sm text-red-600 mt-1">เหตุผล: {log.reason}</div>}
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setHistoryOpen(false)}>ปิด</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
`;

content = content.replace('</Dialog>\n      \n        {/* Delete Confirmation Dialog */}', '</Dialog>\n\n' + historyModal + '\n        {/* Delete Confirmation Dialog */}');

fs.writeFileSync(file, content);
console.log('Phase 3 complete');
