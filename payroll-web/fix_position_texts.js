const fs = require('fs');
const file = 'src/app/dashboard/positions/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace texts
content = content.replace(/ประเภทพนักงาน/g, "ตำแหน่ง");
content = content.replace(/ตั้งค่าประเภทพนักงาน เช่น ข้าราชการ, ลจ.ประจำ, พนักงาน, พกส. ฯลฯ/g, "ตั้งค่าตำแหน่ง เช่น ผู้อำนวยการ, แพทย์, พยาบาลวิชาชีพ ฯลฯ");
content = content.replace(/เพิ่มประเภทใหม่/g, "เพิ่มตำแหน่งใหม่");
content = content.replace(/ค้นหาประเภท\.\.\./g, "ค้นหาตำแหน่ง...");
content = content.replace(/ไม่พบข้อมูลประเภทพนักงาน/g, "ไม่พบข้อมูลตำแหน่ง");
content = content.replace(/แก้ไขประเภทพนักงาน/g, "แก้ไขตำแหน่ง");
content = content.replace(/เพิ่มประเภทพนักงาน/g, "เพิ่มตำแหน่ง");
content = content.replace(/ลบประเภทพนักงาน/g, "ลบตำแหน่ง");

fs.writeFileSync(file, content);
