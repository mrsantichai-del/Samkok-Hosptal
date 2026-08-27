import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Updating roles...');
  
  // Create or Update the 4 required roles
  const roles = [
    { name: 'System Administrator', description: 'ผู้ดูแลระบบสูงสุด จัดการสิทธิ์และการตั้งค่า' },
    { name: 'Finance Officer', description: 'เจ้าหน้าที่ฝ่ายการเงิน จัดการเงินเดือนและบุคลากร' },
    { name: 'Executive', description: 'ผู้บริหาร พิจารณาและอนุมัติ ดูรายงาน' },
    { name: 'Employee', description: 'บุคลากรทั่วไป ดูสลิปเงินเดือน' }
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: { name: r.name, description: r.description }
    });
  }

  // Cleanup old unneeded roles like 'Admin', 'HR' if they exist and are not in the new list
  // Note: we can just leave them or soft delete them
  await prisma.role.updateMany({
    where: { name: { in: ['Admin', 'HR'] } },
    data: { deletedAt: new Date() }
  });

  console.log('Roles updated successfully');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
