const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const firstNames = ["สมชาย", "สมศรี", "วิชัย", "มาลี", "สุชาติ", "นฤมล", "ประสิทธิ์", "พรพรรณ", "ชัยยุทธ", "กนกวรรณ", "อานนท์", "รัตนา", "เอกชัย", "จิราพร", "วิศรุต", "สุภาวดี", "พงศกร", "นภัสสร", "ธนพล", "ศิริพร", "กิตติ", "ดารุณี", "ณัฐวุฒิ", "พัชรา"];
const lastNames = ["ใจดี", "มีสุข", "รักไทย", "เจริญขวัญ", "พิทักษ์", "มั่นคง", "บุญส่ง", "แสงดาว", "ชัยชนะ", "งามตา", "ทองแท้", "รุ่งเรือง", "วัฒนา", "ศรีสุข", "สมบูรณ์", "ประเสริฐ"];

function getRandomName() {
  const f = firstNames[Math.floor(Math.random() * firstNames.length)];
  const l = lastNames[Math.floor(Math.random() * lastNames.length)];
  return { firstName: f, lastName: l };
}

function getSalaryByPosition(posName) {
  if (posName.includes("แพทย์") || posName.includes("ผู้อำนวยการ")) return Math.floor(Math.random() * 20000) + 40000;
  if (posName.includes("พยาบาล") || posName.includes("เภสัชกร") || posName.includes("นักวิชาการ") || posName.includes("นักเทคนิค")) return Math.floor(Math.random() * 10000) + 20000;
  if (posName.includes("เจ้าพนักงาน")) return Math.floor(Math.random() * 5000) + 15000;
  return Math.floor(Math.random() * 3000) + 12000; // พนักงานทั่วไป, ผู้ช่วย ฯลฯ
}

async function main() {
  console.log("Starting seed script...");

  // 1. Get all positions
  const positions = await prisma.position.findMany();
  console.log(`Found ${positions.length} positions.`);

  // 2. Setup Pay Items
  const payItems = [
    { name: 'เงินเดือน', type: 'INCOME', isDefault: true },
    { name: 'ค่าล่วงเวลา (OT)', type: 'INCOME', isDefault: false },
    { name: 'ประกันสังคม', type: 'DEDUCTION', isDefault: true },
    { name: 'ภาษีหัก ณ ที่จ่าย', type: 'DEDUCTION', isDefault: false },
  ];
  
  const payItemMap = {};
  for (const pi of payItems) {
    const item = await prisma.payItem.upsert({
      where: { name: pi.name },
      update: { type: pi.type, isDefault: pi.isDefault },
      create: { name: pi.name, type: pi.type, isDefault: pi.isDefault },
    });
    payItemMap[pi.name] = item.id;
  }
  console.log("Pay items setup complete.");

  // 3. Generate Employees
  let employeeCodeCounter = 1000;
  const employees = [];
  
  for (const pos of positions) {
    for (let i = 0; i < 2; i++) {
      const { firstName, lastName } = getRandomName();
      const baseSalary = getSalaryByPosition(pos.name);
      
      const empCode = `EMP${employeeCodeCounter++}`;
      const emp = await prisma.employee.upsert({
        where: { employeeCode: empCode },
        update: {
          firstName, lastName, positionId: pos.id, departmentId: pos.departmentId, baseSalary
        },
        create: {
          employeeCode: empCode,
          firstName, lastName, positionId: pos.id, departmentId: pos.departmentId, baseSalary
        }
      });
      employees.push(emp);
    }
  }
  console.log(`Generated ${employees.length} employees.`);

  // 4. Generate Payroll Records and Transactions from 1/2025 to 8/2026
  const monthsToGenerate = [];
  for (let year = 2025; year <= 2026; year++) {
    const endMonth = year === 2026 ? 8 : 12;
    for (let month = 1; month <= endMonth; month++) {
      monthsToGenerate.push({ month, year });
    }
  }

  console.log(`Generating payroll for ${monthsToGenerate.length} months...`);
  
  for (const { month, year } of monthsToGenerate) {
    let pr = await prisma.payrollRecord.findUnique({
      where: { month_year: { month, year } }
    });
    if (!pr) {
      pr = await prisma.payrollRecord.create({
        data: { month, year, status: 'APPROVED' }
      });
    }

    // Generate transactions for each employee
    for (const emp of employees) {
      // Basic salary
      await prisma.payrollTransaction.upsert({
        where: { payrollRecordId_employeeId_payItemId: { payrollRecordId: pr.id, employeeId: emp.id, payItemId: payItemMap['เงินเดือน'] } },
        update: { amount: emp.baseSalary },
        create: { payrollRecordId: pr.id, employeeId: emp.id, payItemId: payItemMap['เงินเดือน'], amount: emp.baseSalary }
      });

      // OT (random 0 to 3000)
      const ot = Math.floor(Math.random() * 3000);
      if (ot > 0) {
        await prisma.payrollTransaction.upsert({
          where: { payrollRecordId_employeeId_payItemId: { payrollRecordId: pr.id, employeeId: emp.id, payItemId: payItemMap['ค่าล่วงเวลา (OT)'] } },
          update: { amount: ot },
          create: { payrollRecordId: pr.id, employeeId: emp.id, payItemId: payItemMap['ค่าล่วงเวลา (OT)'], amount: ot }
        });
      }

      // Social Security (5% max 750)
      const sso = Math.min(Number(emp.baseSalary) * 0.05, 750);
      await prisma.payrollTransaction.upsert({
        where: { payrollRecordId_employeeId_payItemId: { payrollRecordId: pr.id, employeeId: emp.id, payItemId: payItemMap['ประกันสังคม'] } },
        update: { amount: sso },
        create: { payrollRecordId: pr.id, employeeId: emp.id, payItemId: payItemMap['ประกันสังคม'], amount: sso }
      });

      // Tax (random fixed amount)
      if (emp.baseSalary > 25000) {
        const tax = Math.floor(Math.random() * 1000) + 500;
        await prisma.payrollTransaction.upsert({
          where: { payrollRecordId_employeeId_payItemId: { payrollRecordId: pr.id, employeeId: emp.id, payItemId: payItemMap['ภาษีหัก ณ ที่จ่าย'] } },
          update: { amount: tax },
          create: { payrollRecordId: pr.id, employeeId: emp.id, payItemId: payItemMap['ภาษีหัก ณ ที่จ่าย'], amount: tax }
        });
      }
    }
  }

  console.log("Mock data generation completed successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
