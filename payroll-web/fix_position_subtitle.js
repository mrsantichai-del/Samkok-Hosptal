const fs = require('fs');
const file = 'src/app/dashboard/positions/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "ตั้งค่าตำแหน่ง เช่น ข้าราชการ, ลจ.ประจำ, พนักงาน, พกส. ฯลฯ",
  "ตั้งค่าตำแหน่ง เช่น ผู้อำนวยการ, แพทย์, พยาบาลวิชาชีพ ฯลฯ"
);

fs.writeFileSync(file, content);
