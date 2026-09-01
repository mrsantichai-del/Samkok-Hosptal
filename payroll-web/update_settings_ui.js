const fs = require('fs');

const file = 'src/app/dashboard/settings/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const signatureCardStart = content.indexOf('<Card>\n        <CardHeader>\n          <CardTitle>ลายเซ็นผู้อนุมัติ / ฝ่ายการเงิน</CardTitle>');
const signatureCardEnd = content.indexOf('</Card>', signatureCardStart) + 7;

if (signatureCardStart !== -1) {
  content = content.slice(0, signatureCardStart) + content.slice(signatureCardEnd);
}

// Remove the text about signature
content = content.replace(
  'ตั้งค่าโลโก้โรงพยาบาลและลายเซ็นสำหรับออกสลิปเงินเดือน (PDF)',
  'ตั้งค่าโลโก้โรงพยาบาลสำหรับออกสลิปเงินเดือน (PDF)'
);

fs.writeFileSync(file, content);
console.log("Updated settings page");
