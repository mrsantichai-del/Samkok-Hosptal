const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const types = [
  "ข้าราชการ",
  "พนักงานราชการ",
  "ลูกจ้างประจำ",
  "ลูกจ้างชั่วคราว",
  "พกส.",
  "รายเดือน",
  "รายวัน"
];

async function main() {
  for (const name of types) {
    await prisma.employeeType.upsert({
      where: { name: name },
      update: { deletedAt: null }, // Restore soft-deleted ones
      create: { name: name },
    });
  }
  console.log("Employee types restored successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
