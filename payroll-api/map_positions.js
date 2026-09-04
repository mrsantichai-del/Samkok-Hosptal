const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const mapping = [
  { position: "ผู้อำนวยการ", department: "ผู้อำนวยการโรงพยาบาล" },
  { position: "แพทย์", department: "กลุ่มงานการแพทย์ (แพทย์)" },
  { position: "ทันตแพทย์", department: "กลุ่มงานทันตกรรม ห้องฟัน" },
  { position: "เภสัชกร", department: "กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค ห้องยา" },
  { position: "พยาบาลวิชาชีพ", department: "กลุ่มงานพยาบาล" },
  { position: "นักเทคนิคการแพทย์", department: "กลุ่มงานเทคนิคการแพทย์ LAB" },
  { position: "นักกายภาพบำบัด", department: "กลุ่มงานเวชกรรมฟื้นฟู (กายภาพ)" },
  { position: "เจ้าพนักงานทันตสาธารณสุข", department: "กลุ่มงานทันตกรรม ห้องฟัน" },
  { position: "เจ้าพนักงานวิทยาศาสตร์การแพทย์", department: "กลุ่มงานเทคนิคการแพทย์ LAB" },
  { position: "เจ้าพนักงานรังสีการแพทย์", department: "กลุ่มงานรังสีวิทยา x-ray" },
  { position: "เจ้าพนักงานเภสัชกรรม", department: "กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค ห้องยา" },
  { position: "เจ้าพนักงานเวชสถิติ", department: "-" },
  { position: "เจ้าพนักงานสาธารณสุข (เวชกิจฉุกเฉิน)", department: "-" },
  { position: "นักวิชาการสาธารณสุข", department: "กลุ่มงานบริการด้านปฐมภูมิและองค์รวม" },
  { position: "นักโภชนาการ", department: "กลุ่มงานโภชนศาสตร์ โรงครัว" },
  { position: "นักจิตวิทยา", department: "กลุ่มงานจิตเวชและยาเสพติด" },
  { position: "แพทย์แผนไทย", department: "กลุ่มงานการแพทย์แผนไทยและการแพทย์ทางเลือก (แผนไทย)" },
  { position: "นักจัดการงานทั่วไป", department: "กลุ่มงานบริหารทั่วไป" },
  { position: "นักวิชาการเงินและบัญชี", department: "กลุ่มงานบริหารทั่วไป" },
  { position: "พนักงานซักฟอก", department: "กลุ่มงานบริหารทั่วไป" },
  { position: "พนักงานธุรการ", department: "กลุ่มงานประกันสุขภาพยุทธศาสตร์ UC" },
  { position: "พนักงานช่วยเหลือคนไข้", department: "กลุ่มงานพยาบาล" },
  { position: "พนักงานประจำห้องยา", department: "กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค ห้องยา" },
  { position: "ผู้ช่วยทันตแพทย์", department: "กลุ่มงานทันตกรรม ห้องฟัน" },
  { position: "พนักงานขับรถยนต์", department: "กลุ่มงานบริหารทั่วไป" },
  { position: "พนักงานทั่วไป", department: "กลุ่มงานบริหารทั่วไป" },
  { position: "นายช่างเทคนิค", department: "กลุ่มงานบริหารทั่วไป" },
  { position: "พนักงานพัสดุ", department: "กลุ่มงานบริหารทั่วไป" },
  { position: "เจ้าพนักงานเครื่องคอมพิวเตอร์", department: "กลุ่มงานสุขภาพดิจิทัล (IT+เครื่องมือแพทย์)" },
  { position: "พนักงานประกอบอาหาร", department: "กลุ่มงานโภชนศาสตร์ โรงครัว" },
  { position: "พนักงานการแพทย์และรังสีเทคนิค", department: "กลุ่มงานรังสีวิทยา x-ray" },
  { position: "ผู้ช่วยนักกายภาพบำบัด", department: "กลุ่มงานเวชกรรมฟื้นฟู (กายภาพ)" },
  { position: "พนักงานเปล", department: "กลุ่มงานพยาบาล" },
  { position: "พนักงานบริการ", department: "กลุ่มงานพยาบาล" },
  { position: "พนักงานประจำห้องทดลอง", department: "กลุ่มงานเทคนิคการแพทย์ LAB" },
  { position: "เจ้าพนักงานการเงินและบัญชี", department: "กลุ่มงานบริหารทั่วไป" },
  { position: "นักวิชาการพัสดุ", department: "กลุ่มงานบริหารทั่วไป" },
  { position: "เจ้าพนักงานพัสดุ", department: "กลุ่มงานบริหารทั่วไป" },
  { position: "พนักงานพิมพ์", department: "-" },
  { position: "นักวิชาการคอมพิวเตอร์", department: "กลุ่มงานสุขภาพดิจิทัล (IT+เครื่องมือแพทย์)" },
  { position: "นักวิชาการสถิติ", department: "กลุ่มงานประกันสุขภาพยุทธศาสตร์ UC" },
];

async function main() {
  const departments = await prisma.department.findMany();
  const deptMap = new Map(departments.map(d => [d.name, d.id]));

  for (const item of mapping) {
    if (item.department === '-' || !item.department) continue;
    const deptId = deptMap.get(item.department);
    if (!deptId) {
      console.log('Department not found:', item.department);
      continue;
    }
    
    // First, ensure the position exists
    await prisma.position.upsert({
      where: { name: item.position },
      update: { departmentId: deptId, deletedAt: null },
      create: { name: item.position, departmentId: deptId },
    });
  }
  console.log("Positions mapped to departments successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
