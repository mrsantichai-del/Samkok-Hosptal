const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const activeTypes = await prisma.employeeType.findMany({
    where: { deletedAt: null }
  });
  
  if (activeTypes.length === 0) {
    console.log("No active employee types found!");
    return;
  }

  const allEmployees = await prisma.employee.findMany();
  let updatedCount = 0;

  for (const emp of allEmployees) {
    // We re-assign EVERYONE just to make sure no one has a deleted type
    const randomType = activeTypes[Math.floor(Math.random() * activeTypes.length)];
    await prisma.employee.update({
      where: { id: emp.id },
      data: { employeeTypeId: randomType.id }
    });
    updatedCount++;
  }
  
  console.log(`Re-assigned ${updatedCount} employees to ONLY active types.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
