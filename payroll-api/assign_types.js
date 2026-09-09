const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const employeeTypes = await prisma.employeeType.findMany();
  if (employeeTypes.length === 0) {
    console.log("No employee types found!");
    return;
  }

  const allEmployees = await prisma.employee.findMany();
  let updatedCount = 0;

  for (const emp of allEmployees) {
    if (!emp.employeeTypeId) {
      // Pick a random employee type
      const randomType = employeeTypes[Math.floor(Math.random() * employeeTypes.length)];
      await prisma.employee.update({
        where: { id: emp.id },
        data: { employeeTypeId: randomType.id }
      });
      updatedCount++;
    }
  }
  console.log(`Assigned random employee types to ${updatedCount} employees.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
