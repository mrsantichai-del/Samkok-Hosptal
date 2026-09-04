const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const positions = [
  "นักวิชาการเงินและบัญชี",
  "พนักงานซักฟอก",
  "พนักงานธุรการ",
  "พนักงานช่วยเหลือคนไข้",
  "พนักงานประจำห้องยา",
  "ผู้ช่วยทันตแพทย์",
  "พนักงานขับรถยนต์",
  "พนักงานทั่วไป",
  "นายช่างเทคนิค",
  "พนักงานพัสดุ",
  "เจ้าพนักงานเครื่องคอมพิวเตอร์",
  "พนักงานประกอบอาหาร",
  "พนักงานการแพทย์และรังสีเทคนิค",
  "ผู้ช่วยนักกายภาพบำบัด",
  "พนักงานเปล",
  "พนักงานบริการ",
  "พนักงานประจำห้องทดลอง",
  "เจ้าพนักงานการเงินและบัญชี",
  "นักวิชาการพัสดุ",
  "เจ้าพนักงานพัสดุ",
  "พนักงานพิมพ์",
  "นักวิชาการคอมพิวเตอร์",
  "นักวิชาการสถิติ"
];

async function main() {
  for (const name of positions) {
    await prisma.position.upsert({
      where: { name: name },
      update: {},
      create: { name: name },
    });
  }
  console.log("Positions added successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
