const fs = require('fs');

const file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add handleApprove function
const handleApproveCode = `
  const handleApprove = async () => {
    if (!confirm("คุณต้องการอนุมัติเงินเดือนงวดนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
    try {
      const token = Cookies.get("token");
      await axios.patch(\`\${API_URL}/payroll/records/\${id}/approve\`, {}, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      toast.success("อนุมัติเงินเดือนสำเร็จ");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการอนุมัติเงินเดือน");
    }
  };
`;

if (!content.includes('const handleApprove = async')) {
  content = content.replace(
    'const exportPdf = async () => {',
    handleApproveCode + '\n  const exportPdf = async () => {'
  );
}

// 2. Add Approve Button UI
const approveButtonUI = `
          {payrollRecord?.status === "DRAFT" && (
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              <Check className="w-4 h-4 mr-2" /> อนุมัติเงินเดือนงวดนี้
            </Button>
          )}
          {payrollRecord?.status === "APPROVED" && (
            <div className="flex items-center text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-md border border-green-200">
              <Check className="w-4 h-4 mr-2" /> อนุมัติแล้ว
            </div>
          )}
`;

if (!content.includes('อนุมัติเงินเดือนงวดนี้')) {
  content = content.replace(
    '<Button onClick={exportExcel} variant="outline">',
    approveButtonUI + '\n          <Button onClick={exportExcel} variant="outline">'
  );
}

fs.writeFileSync(file, content);
console.log("Updated payroll/[id]/page.tsx");
