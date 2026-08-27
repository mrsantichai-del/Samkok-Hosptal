import 'dotenv/config';
import { PrismaClient, PayItemType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as ExcelJS from 'exceljs';

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed transactions...');
  
  const filePath = 'C:/D/Samkok-Hosptal/โครงการ  รพ สามโคก/รวมเงินเดือนให้แอน.xlsx';
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheetsToProcess = [
    'ข้าราชการ', 'ลจ.ประจำ', 'พนักงาน', 'พกส.', 'รายเดือน', 
    'รายวัน', 'ช่วย', 'ขร1', 'ขร2', 'ขร3', 'ลจ', 'พนง.ราชการ', 
    'พกส.1', 'พกส.1 (2)', 'รด.1', 'รว', 'รว (2)', '1ช่วย'
  ];

  // Create PayrollRecord for August 2026
  const payrollRecord = await prisma.payrollRecord.upsert({
    where: { month_year: { month: 8, year: 2026 } },
    update: { status: 'APPROVED' },
    create: { month: 8, year: 2026, status: 'APPROVED' }
  });

  // Clear existing transactions for this month to prevent duplicates during re-seed
  await prisma.payrollTransaction.deleteMany({
    where: { payrollRecordId: payrollRecord.id }
  });

  let totalTransactions = 0;

  for (const sheetName of sheetsToProcess) {
    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) continue;
    
    console.log(`Processing transactions for sheet: ${sheetName}...`);

    let headerRowIndex = 4;
    const headerRow = worksheet.getRow(headerRowIndex).values as any[];
    if (!headerRow || headerRow.length < 5) continue;

    const typeRow = worksheet.getRow(3).values as any[];
    const payItemCache = new Map<number, string>();
    
    for (let col = 6; col < headerRow.length; col++) {
       let colName = headerRow[col];
       if (typeof colName === 'string' && colName.trim() !== '' && colName !== 'รวม' && colName !== 'รับจริง') {
          colName = colName.trim().replace(/\r?\n|\r/g, ' ');
          // Find PayItem ID from database
          const payItem = await prisma.payItem.findFirst({
            where: { name: colName }
          });
          if (payItem) {
            payItemCache.set(col, payItem.id);
          }
       }
    }

    const transactionsToInsert = [];

    // Process Employees
    for (let rowIndex = headerRowIndex + 1; rowIndex <= worksheet.rowCount; rowIndex++) {
      const row = worksheet.getRow(rowIndex).values as any[];
      if (!row || !row[2]) continue; 

      let firstName = (row[3] || '').toString().trim();
      let lastName = (row[4] || '').toString().trim();
      
      if (!firstName && !lastName) continue;
      
      if (!lastName && firstName.includes(' ')) {
         const parts = firstName.split(' ');
         firstName = parts[0];
         lastName = parts.slice(1).join(' ');
      }

      const employeeCode = `EMP-${Buffer.from(firstName).toString('hex').substring(0, 6).toUpperCase()}`;
      
      const employee = await prisma.employee.findUnique({
        where: { employeeCode }
      });

      if (!employee) continue;

      // Extract amounts
      for (let col = 6; col < row.length; col++) {
        if (payItemCache.has(col)) {
          let cellValue = row[col];
          // Handle formulas in excel (e.g. { result: 500 })
          if (cellValue && typeof cellValue === 'object' && cellValue.result !== undefined) {
             cellValue = cellValue.result;
          }
          
          const amount = parseFloat(cellValue);
          if (!isNaN(amount) && amount > 0) {
             transactionsToInsert.push({
               payrollRecordId: payrollRecord.id,
               employeeId: employee.id,
               payItemId: payItemCache.get(col) as string,
               amount: amount,
               formulaUsed: 'EXCEL_IMPORT'
             });
          }
        }
      }
    }

    if (transactionsToInsert.length > 0) {
       await prisma.payrollTransaction.createMany({
         data: transactionsToInsert
       });
       totalTransactions += transactionsToInsert.length;
    }
  }

  console.log(`Seed completed successfully! Inserted ${totalTransactions} transactions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
