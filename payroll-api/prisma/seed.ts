import { PrismaClient, PayItemType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as ExcelJS from 'exceljs';
import * as path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');
  
  const filePath = 'C:/D/Samkok-Hosptal/โครงการ  รพ สามโคก/รวมเงินเดือนให้แอน.xlsx';
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheetsToProcess = [
    'ข้าราชการ', 'ลจ.ประจำ', 'พนักงาน', 'พกส.', 'รายเดือน', 
    'รายวัน', 'ช่วย', 'ขร1', 'ขร2', 'ขร3', 'ลจ', 'พนง.ราชการ', 
    'พกส.1', 'พกส.1 (2)', 'รด.1', 'รว', 'รว (2)', '1ช่วย'
  ];

  // 1. Create Default Roles
  await prisma.role.upsert({ where: { name: 'Admin' }, update: {}, create: { name: 'Admin' } });
  await prisma.role.upsert({ where: { name: 'HR' }, update: {}, create: { name: 'HR' } });
  await prisma.role.upsert({ where: { name: 'Employee' }, update: {}, create: { name: 'Employee' } });

  // 2. Loop through each sheet
  for (const sheetName of sheetsToProcess) {
    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) continue;
    
    console.log(`Processing sheet: ${sheetName}...`);

    // Create or find EmployeeType based on sheet name
    const employeeType = await prisma.employeeType.upsert({
      where: { name: sheetName },
      update: {},
      create: { name: sheetName }
    });

    // We assume row 4 has headers, but we should find the row dynamically or just assume 4
    let headerRowIndex = 4;
    const headerRow = worksheet.getRow(headerRowIndex).values as any[];
    if (!headerRow || headerRow.length < 5) {
       console.log(`Skipping sheet ${sheetName}, header row not matching.`);
       continue;
    }

    // Extract PayItems (Incomes and Deductions) dynamically
    // In standard sheet: Col 3,4=Name, Col 5=Position. Income starts at Col 6, Deduction starts after 'รวมรายรับ' or specific columns.
    // We will parse row 3 to see if it's 'รายรับ' or 'รายจ่าย'
    const typeRow = worksheet.getRow(3).values as any[];
    
    const payItemCache = new Map<number, string>();
    
    for (let col = 6; col < headerRow.length; col++) {
       let colName = headerRow[col];
       let colTypeStr = typeRow[col];
       
       if (typeof colName === 'string' && colName.trim() !== '' && colName !== 'รวม' && colName !== 'รับจริง') {
          colName = colName.trim().replace(/\r?\n|\r/g, ' ');
          
          let payType: any = PayItemType.INCOME;
          if (typeof colTypeStr === 'string' && colTypeStr.includes('รายจ่าย')) {
             payType = PayItemType.DEDUCTION;
          } else if (['ภาษี', 'กบข.', 'กยศ.', 'ฌกส.', 'ออมสิน', 'กรุงไทย', 'ไฟฟ้า', 'ประปา'].includes(colName)) {
             payType = PayItemType.DEDUCTION;
          }

          // Create PayItem
          const payItem = await prisma.payItem.upsert({
             where: { name: colName },
             update: { type: payType },
             create: { name: colName, type: payType }
          });
          payItemCache.set(col, payItem.id);
       }
    }

    // Process Employees
    for (let rowIndex = headerRowIndex + 1; rowIndex <= worksheet.rowCount; rowIndex++) {
      const row = worksheet.getRow(rowIndex).values as any[];
      if (!row || !row[2]) continue; // Skip empty rows or rows without numbers

      // Try to get Name (Col 3,4)
      let firstName = (row[3] || '').toString().trim();
      let lastName = (row[4] || '').toString().trim();
      
      if (!firstName && !lastName) continue;
      
      if (!lastName && firstName.includes(' ')) {
         const parts = firstName.split(' ');
         firstName = parts[0];
         lastName = parts.slice(1).join(' ');
      }

      let positionName = (row[5] || '').toString().trim();
      if (!positionName) positionName = 'ไม่ระบุ';

      // Create Position
      const position = await prisma.position.upsert({
         where: { name: positionName },
         update: {},
         create: { name: positionName }
      });

      // Generate a mock employee code since we don't have one in excel
      const employeeCode = `EMP-${Buffer.from(firstName).toString('hex').substring(0, 6).toUpperCase()}`;

      // Create Employee
      await prisma.employee.upsert({
         where: { employeeCode: employeeCode },
         update: { 
            positionId: position.id,
            employeeTypeId: employeeType.id
         },
         create: {
            employeeCode: employeeCode,
            firstName: firstName,
            lastName: lastName,
            positionId: position.id,
            employeeTypeId: employeeType.id
         }
      });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
