const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Get all positions
  const allPositions = await prisma.position.findMany();
  
  // Clean positions are those that don't contain "ชื่อ" or "นาง" or "นาย"
  const dirtyPositions = allPositions.filter(p => p.name.includes('ชื่อ') || p.name.includes('นาง') || p.name.includes('นาย ') || p.name.includes('ตำแหน่ง'));
  
  console.log(`Found ${dirtyPositions.length} dirty positions.`);

  for (const dirty of dirtyPositions) {
    // Extract actual position name from the dirty string
    // e.g. "ชื่อ  นางสาววิลาวัณย์  วงศ์ราตรี          ตำแหน่ง  พยาบาลวิชาชีพปฎิบัติการ"
    let realPosName = dirty.name;
    if (dirty.name.includes('ตำแหน่ง')) {
      realPosName = dirty.name.split('ตำแหน่ง')[1].trim();
    } else {
      continue; // Can't easily extract, skip for manual review or just delete if unused
    }

    // Standardize some names
    if (realPosName === 'พยาบาลวิชาชีพปฎิบัติการ' || realPosName === 'พยาบาลวิชาชีพชำนาญการ') realPosName = 'พยาบาลวิชาชีพ';
    if (realPosName === 'นักวิชาการสาธารณสุขปฏิบัติการ') realPosName = 'นักวิชาการสาธารณสุข';

    // Find or create the clean position
    let cleanPos = await prisma.position.findFirst({
      where: { name: realPosName }
    });

    if (!cleanPos) {
      cleanPos = await prisma.position.create({
        data: { name: realPosName }
      });
      console.log(`Created clean position: ${realPosName}`);
    }

    // Reassign all employees connected to this dirty position to the clean one
    const affectedEmployees = await prisma.employee.updateMany({
      where: { positionId: dirty.id },
      data: { positionId: cleanPos.id }
    });

    console.log(`Reassigned ${affectedEmployees.count} employees from "${dirty.name}" to "${cleanPos.name}"`);

    // Delete the dirty position
    await prisma.position.delete({
      where: { id: dirty.id }
    });
    console.log(`Deleted dirty position: ${dirty.name}`);
  }

  // Also, clean up any dirty positions that have 0 employees
  const unusedDirty = await prisma.position.findMany({
    where: { employees: { none: {} } }
  });
  
  let deletedCount = 0;
  for (const u of unusedDirty) {
    if (u.name.includes('ชื่อ') || u.name.includes('นาง') || u.name.includes('นาย') || u.name.includes('ตำแหน่ง')) {
      await prisma.position.delete({ where: { id: u.id } });
      deletedCount++;
    }
  }
  console.log(`Deleted ${deletedCount} unused dirty positions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
