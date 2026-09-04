const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const departments = [
  "ผู้อำนวยการโรงพยาบาล",
  "กลุ่มงานการแพทย์ (แพทย์)",
  "กลุ่มงานทันตกรรม ห้องฟัน",
  "กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค ห้องยา",
  "กลุ่มงานพยาบาล",
  "กลุ่มงานเทคนิคการแพทย์ LAB",
  "กลุ่มงานเวชกรรมฟื้นฟู (กายภาพ)",
  "กลุ่มงานรังสีวิทยา x-ray",
  "-",
  "กลุ่มงานบริการด้านปฐมภูมิและองค์รวม",
  "กลุ่มงานโภชนศาสตร์ โรงครัว",
  "กลุ่มงานจิตเวชและยาเสพติด",
  "กลุ่มงานการแพทย์แผนไทยและการแพทย์ทางเลือก (แผนไทย)",
  "กลุ่มงานบริหารทั่วไป",
  "กลุ่มงานประกันสุขภาพยุทธศาสตร์ UC",
  "กลุ่มงานสุขภาพดิจิทัล (IT+เครื่องมือแพทย์)"
];

async function main() {
  for (const name of departments) {
    if (!name.trim()) continue;
    await prisma.department.upsert({
      where: { name: name },
      update: { deletedAt: null }, // Restore if soft-deleted
      create: { name: name },
    });
  }
  console.log("Departments added successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
