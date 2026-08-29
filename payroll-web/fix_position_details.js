const fs = require('fs');
const file = 'src/app/dashboard/positions/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("ชื่อตำแหน่ง (เช่น ข้าราชการ)", "ชื่อตำแหน่ง (เช่น แพทย์)");
content = content.replace("กรอกชื่อประเภท", "กรอกชื่อตำแหน่ง");

fs.writeFileSync(file, content);
