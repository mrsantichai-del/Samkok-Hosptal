const fs = require('fs');

function fixErrorHandling(file) {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(
    /alert\(e\.response\?\.data\?\.message \|\| "เกิดข้อผิดพลาดในการบันทึก"\);/g,
    'toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึก");'
  );

  content = content.replace(
    /alert\(e\.response\?\.data\?\.message \|\| "เกิดข้อผิดพลาดในการลบ \(อาจมีพนักงานใช้งานอยู่\)"\);/g,
    'toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการลบ (อาจมีพนักงานใช้งานอยู่)");'
  );

  fs.writeFileSync(file, content);
}

fixErrorHandling('src/app/dashboard/positions/page.tsx');
fixErrorHandling('src/app/dashboard/employee-types/page.tsx');
