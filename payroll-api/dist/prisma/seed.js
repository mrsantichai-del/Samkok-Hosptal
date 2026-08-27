"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const ExcelJS = __importStar(require("exceljs"));
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
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
    await prisma.role.upsert({ where: { name: 'Admin' }, update: {}, create: { name: 'Admin' } });
    await prisma.role.upsert({ where: { name: 'HR' }, update: {}, create: { name: 'HR' } });
    await prisma.role.upsert({ where: { name: 'Employee' }, update: {}, create: { name: 'Employee' } });
    for (const sheetName of sheetsToProcess) {
        const worksheet = workbook.getWorksheet(sheetName);
        if (!worksheet)
            continue;
        console.log(`Processing sheet: ${sheetName}...`);
        const employeeType = await prisma.employeeType.upsert({
            where: { name: sheetName },
            update: {},
            create: { name: sheetName }
        });
        let headerRowIndex = 4;
        const headerRow = worksheet.getRow(headerRowIndex).values;
        if (!headerRow || headerRow.length < 5) {
            console.log(`Skipping sheet ${sheetName}, header row not matching.`);
            continue;
        }
        const typeRow = worksheet.getRow(3).values;
        const payItemCache = new Map();
        for (let col = 6; col < headerRow.length; col++) {
            let colName = headerRow[col];
            let colTypeStr = typeRow[col];
            if (typeof colName === 'string' && colName.trim() !== '' && colName !== 'รวม' && colName !== 'รับจริง') {
                colName = colName.trim().replace(/\r?\n|\r/g, ' ');
                let payType = client_1.PayItemType.INCOME;
                if (typeof colTypeStr === 'string' && colTypeStr.includes('รายจ่าย')) {
                    payType = client_1.PayItemType.DEDUCTION;
                }
                else if (['ภาษี', 'กบข.', 'กยศ.', 'ฌกส.', 'ออมสิน', 'กรุงไทย', 'ไฟฟ้า', 'ประปา'].includes(colName)) {
                    payType = client_1.PayItemType.DEDUCTION;
                }
                const payItem = await prisma.payItem.upsert({
                    where: { name: colName },
                    update: { type: payType },
                    create: { name: colName, type: payType }
                });
                payItemCache.set(col, payItem.id);
            }
        }
        for (let rowIndex = headerRowIndex + 1; rowIndex <= worksheet.rowCount; rowIndex++) {
            const row = worksheet.getRow(rowIndex).values;
            if (!row || !row[2])
                continue;
            let firstName = (row[3] || '').toString().trim();
            let lastName = (row[4] || '').toString().trim();
            if (!firstName && !lastName)
                continue;
            if (!lastName && firstName.includes(' ')) {
                const parts = firstName.split(' ');
                firstName = parts[0];
                lastName = parts.slice(1).join(' ');
            }
            let positionName = (row[5] || '').toString().trim();
            if (!positionName)
                positionName = 'ไม่ระบุ';
            const position = await prisma.position.upsert({
                where: { name: positionName },
                update: {},
                create: { name: positionName }
            });
            const employeeCode = `EMP-${Buffer.from(firstName).toString('hex').substring(0, 6).toUpperCase()}`;
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
//# sourceMappingURL=seed.js.map