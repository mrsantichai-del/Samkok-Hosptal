"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxReportsService = void 0;
exports.thaiBahtText = thaiBahtText;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function thaiBahtText(num) {
    const number = Number(num);
    if (isNaN(number) || number === 0)
        return 'ศูนย์บาทถ้วน';
    const numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    const places = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
    const fixed = number.toFixed(2);
    const [intPart, decPart] = fixed.split('.');
    function convertSection(section) {
        let result = '';
        const len = section.length;
        for (let i = 0; i < len; i++) {
            const digit = parseInt(section[i]);
            const place = len - 1 - i;
            if (digit !== 0) {
                if (place === 0 && digit === 1 && len > 1) {
                    result += 'เอ็ด';
                }
                else if (place === 1 && digit === 2) {
                    result += 'ยี่สิบ';
                }
                else if (place === 1 && digit === 1) {
                    result += 'สิบ';
                }
                else {
                    result += numbers[digit] + (place > 0 ? places[place] : '');
                }
            }
        }
        return result;
    }
    let intResult = '';
    if (intPart.length > 6) {
        const millionPart = intPart.slice(0, intPart.length - 6);
        const lowerPart = intPart.slice(intPart.length - 6);
        intResult = convertSection(millionPart) + 'ล้าน' + convertSection(lowerPart);
    }
    else {
        intResult = convertSection(intPart);
    }
    let text = intResult ? intResult + 'บาท' : '';
    if (decPart && decPart !== '00') {
        let decResult = '';
        const d1 = parseInt(decPart[0]);
        const d2 = parseInt(decPart[1]);
        if (d1 !== 0) {
            if (d1 === 1)
                decResult += 'สิบ';
            else if (d1 === 2)
                decResult += 'ยี่สิบ';
            else
                decResult += numbers[d1] + 'สิบ';
        }
        if (d2 !== 0) {
            if (d2 === 1 && d1 !== 0)
                decResult += 'เอ็ด';
            else
                decResult += numbers[d2];
        }
        text += decResult + 'สตางค์';
    }
    else {
        text += 'ถ้วน';
    }
    return text;
}
let TaxReportsService = class TaxReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    hospitalInfo = {
        name: 'โรงพยาบาลสามโคก',
        taxId: '0994000164821',
        address: 'เลขที่ 99 หมู่ 3 ถนนปทุมธานี-เสนา ตำบลสามโคก อำเภอสามโคก จังหวัดปทุมธานี 12160',
        phone: '02-593-1234',
        directorTitle: 'ผู้อำนวยการโรงพยาบาลสามโคก'
    };
    async resolveEmployee(userId, employeeId) {
        if (employeeId && employeeId !== 'me') {
            const emp = await this.prisma.employee.findUnique({
                where: { id: employeeId },
                include: { department: true, position: true, employeeType: true }
            });
            if (emp)
                return emp;
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                employee: {
                    include: { department: true, position: true, employeeType: true }
                }
            }
        });
        if (user?.employee) {
            return user.employee;
        }
        if (user?.username) {
            const emp = await this.prisma.employee.findFirst({
                where: {
                    OR: [
                        { employeeCode: user.username },
                        { idCard: user.username }
                    ],
                    deletedAt: null
                },
                include: { department: true, position: true, employeeType: true }
            });
            if (emp)
                return emp;
        }
        const firstEmp = await this.prisma.employee.findFirst({
            where: { deletedAt: null },
            include: { department: true, position: true, employeeType: true },
            orderBy: { employeeCode: 'asc' }
        });
        return firstEmp;
    }
    async get50Tawi(employeeId, year) {
        let ceYear = Number(year || new Date().getFullYear());
        if (ceYear > 2400)
            ceYear -= 543;
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
            include: { department: true, position: true, employeeType: true }
        });
        if (!employee) {
            throw new common_1.NotFoundException('ไม่พบข้อมูลพนักงาน');
        }
        const records = await this.prisma.payrollRecord.findMany({
            where: {
                year: ceYear,
                deletedAt: null
            },
            orderBy: [{ month: 'asc' }, { round: 'asc' }]
        });
        const recordIds = records.map(r => r.id);
        const transactions = await this.prisma.payrollTransaction.findMany({
            where: {
                payrollRecordId: { in: recordIds },
                employeeId: employee.id,
                deletedAt: null
            },
            include: {
                payItem: true,
                payrollRecord: true
            }
        });
        let sec40_1_income = 0;
        let sec40_1_tax = 0;
        let sec40_2_income = 0;
        let sec40_2_tax = 0;
        let sec40_6_income = 0;
        let sec40_6_tax = 0;
        let ssoAmount = 0;
        let gpfAmount = 0;
        let totalGrossIncome = 0;
        let totalTaxWithheld = 0;
        const monthlyBreakdown = [];
        const monthlyMap = new Map();
        for (let m = 1; m <= 12; m++) {
            monthlyMap.set(m, { gross: 0, tax: 0, sso: 0, gpf: 0 });
        }
        for (const tx of transactions) {
            const amt = Number(tx.amount) || 0;
            const itemName = (tx.payItem?.name || '').toLowerCase();
            const isIncome = tx.payItem?.type === 'INCOME';
            const m = tx.payrollRecord.month;
            const mData = monthlyMap.get(m);
            if (isIncome) {
                totalGrossIncome += amt;
                mData.gross += amt;
                if (itemName.includes('วิชาชีพอิสระ') || itemName.includes('40(6)')) {
                    sec40_6_income += amt;
                }
                else if (itemName.includes('ค่านายหน้า') || itemName.includes('40(2)')) {
                    sec40_2_income += amt;
                }
                else {
                    sec40_1_income += amt;
                }
            }
            else {
                if (itemName.includes('ภาษี') || itemName.includes('tax')) {
                    totalTaxWithheld += amt;
                    sec40_1_tax += amt;
                    mData.tax += amt;
                }
                else if (itemName.includes('ประกันสังคม') || itemName.includes('สปส')) {
                    ssoAmount += amt;
                    mData.sso += amt;
                }
                else if (itemName.includes('กบข') || itemName.includes('กสจ') || itemName.includes('สะสม')) {
                    gpfAmount += amt;
                    mData.gpf += amt;
                }
            }
        }
        for (let m = 1; m <= 12; m++) {
            const data = monthlyMap.get(m);
            monthlyBreakdown.push({
                month: m,
                gross: data.gross,
                tax: data.tax,
                sso: data.sso,
                gpf: data.gpf
            });
        }
        const thaiYear = ceYear + 543;
        return {
            taxYear: thaiYear,
            ceYear: ceYear,
            payer: this.hospitalInfo,
            payee: {
                id: employee.id,
                employeeCode: employee.employeeCode,
                fullName: employee.firstName + ' ' + employee.lastName,
                idCard: employee.idCard || '3100100000000',
                department: employee.department?.name || '-',
                position: employee.position?.name || '-',
                employeeType: employee.employeeType?.name || '-',
                bankAccount: employee.bankAccount,
                bankName: employee.bankName
            },
            incomeSections: {
                sec40_1: {
                    name: '1. เงินเดือน ค่าจ้าง เบี้ยเลี้ยง โบนัส ฯลฯ ตามมาตรา 40 (1)',
                    payDate: 'ทุกสิ้นเดือน (ม.ค. - ธ.ค. ' + thaiYear + ')',
                    amount: sec40_1_income,
                    taxWithheld: sec40_1_tax
                },
                sec40_2: {
                    name: '2. ค่าธรรมเนียม ค่านายหน้า ฯลฯ ตามมาตรา 40 (2)',
                    payDate: sec40_2_income > 0 ? 'ตลอดปี ' + thaiYear : '-',
                    amount: sec40_2_income,
                    taxWithheld: sec40_2_tax
                },
                sec40_6: {
                    name: '3. ค่าวิชาชีพอิสระ ตามมาตรา 40 (6)',
                    payDate: sec40_6_income > 0 ? 'ตลอดปี ' + thaiYear : '-',
                    amount: sec40_6_income,
                    taxWithheld: sec40_6_tax
                }
            },
            funds: {
                socialSecurity: ssoAmount,
                gpfOrProvidentFund: gpfAmount,
                totalFunds: ssoAmount + gpfAmount
            },
            summary: {
                totalIncome: totalGrossIncome,
                totalTaxWithheld: totalTaxWithheld,
                thaiBahtTotalIncome: thaiBahtText(totalGrossIncome),
                thaiBahtTotalTax: thaiBahtText(totalTaxWithheld),
                withholdingCondition: '(1) หัก ณ ที่จ่าย'
            },
            monthlyBreakdown,
            issuedDate: '15 กุมภาพันธ์ พ.ศ. ' + (thaiYear + 1)
        };
    }
    async getMyPayslips(userId, query) {
        const employee = await this.resolveEmployee(userId, query.employeeId);
        if (!employee) {
            throw new common_1.NotFoundException('ไม่พบข้อมูลประวัติบุคลากรที่เชื่อมโยงกับบัญชีผู้ใช้นี้');
        }
        const employeeTxs = await this.prisma.payrollTransaction.findMany({
            where: { employeeId: employee.id, deletedAt: null },
            select: {
                payrollRecord: {
                    select: {
                        id: true,
                        year: true,
                        month: true,
                        round: true,
                        roundName: true,
                        status: true,
                        payPeriodStart: true,
                        payPeriodEnd: true
                    }
                }
            },
            distinct: ['payrollRecordId']
        });
        const availableRecords = employeeTxs
            .map(t => t.payrollRecord)
            .filter(r => r !== null)
            .sort((a, b) => {
            if (a.year !== b.year)
                return b.year - a.year;
            if (a.month !== b.month)
                return b.month - a.month;
            return b.round - a.round;
        });
        if (availableRecords.length === 0) {
            return {
                employee: {
                    id: employee.id,
                    employeeCode: employee.employeeCode,
                    fullName: employee.firstName + ' ' + employee.lastName,
                    idCard: employee.idCard,
                    department: employee.department?.name || '-',
                    position: employee.position?.name || '-',
                    employeeType: employee.employeeType?.name || '-',
                    bankAccount: employee.bankAccount,
                    bankName: employee.bankName,
                    baseSalary: Number(employee.baseSalary) || 0
                },
                hasRecords: false,
                availableRecords: [],
                currentPayslip: null
            };
        }
        let targetRecord = availableRecords[0];
        if (query.year && query.month) {
            let y = Number(query.year);
            if (y > 2400)
                y -= 543;
            const found = availableRecords.find(r => r.year === y && r.month === Number(query.month) && (!query.round || r.round === Number(query.round)));
            if (found)
                targetRecord = found;
        }
        const transactions = await this.prisma.payrollTransaction.findMany({
            where: {
                payrollRecordId: targetRecord.id,
                employeeId: employee.id,
                deletedAt: null
            },
            include: { payItem: true }
        });
        const incomes = [];
        const deductions = [];
        let grossIncome = 0;
        let totalDeductions = 0;
        for (const tx of transactions) {
            const amt = Number(tx.amount) || 0;
            if (tx.payItem?.type === 'INCOME') {
                grossIncome += amt;
                incomes.push({
                    id: tx.payItemId,
                    name: tx.payItem.name,
                    amount: amt
                });
            }
            else {
                totalDeductions += amt;
                deductions.push({
                    id: tx.payItemId,
                    name: tx.payItem.name,
                    amount: amt
                });
            }
        }
        const netPayout = grossIncome - totalDeductions;
        const ytdTxs = await this.prisma.payrollTransaction.findMany({
            where: {
                employeeId: employee.id,
                payrollRecord: {
                    year: targetRecord.year,
                    month: { lte: targetRecord.month },
                    deletedAt: null
                },
                deletedAt: null
            },
            include: { payItem: true }
        });
        let ytdGross = 0;
        let ytdTax = 0;
        let ytdSso = 0;
        let ytdGpf = 0;
        let ytdDeductions = 0;
        for (const tx of ytdTxs) {
            const amt = Number(tx.amount) || 0;
            const itemName = (tx.payItem?.name || '').toLowerCase();
            if (tx.payItem?.type === 'INCOME') {
                ytdGross += amt;
            }
            else {
                ytdDeductions += amt;
                if (itemName.includes('ภาษี') || itemName.includes('tax'))
                    ytdTax += amt;
                else if (itemName.includes('ประกันสังคม') || itemName.includes('สปส'))
                    ytdSso += amt;
                else if (itemName.includes('กบข') || itemName.includes('กสจ') || itemName.includes('สะสม'))
                    ytdGpf += amt;
            }
        }
        const thaiYear = targetRecord.year + 543;
        const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
        return {
            hasRecords: true,
            employee: {
                id: employee.id,
                employeeCode: employee.employeeCode,
                fullName: employee.firstName + ' ' + employee.lastName,
                idCard: employee.idCard,
                department: employee.department?.name || '-',
                position: employee.position?.name || '-',
                employeeType: employee.employeeType?.name || '-',
                bankAccount: employee.bankAccount,
                bankName: employee.bankName,
                baseSalary: Number(employee.baseSalary) || 0
            },
            availableRecords: availableRecords.map(r => ({
                id: r.id,
                year: r.year,
                thaiYear: r.year + 543,
                month: r.month,
                monthName: monthNames[r.month - 1],
                round: r.round,
                roundName: r.roundName,
                label: monthNames[r.month - 1] + ' ' + (r.year + 543) + (r.roundName ? ' (' + r.roundName + ')' : '')
            })),
            currentPayslip: {
                recordId: targetRecord.id,
                year: targetRecord.year,
                thaiYear: thaiYear,
                month: targetRecord.month,
                monthName: monthNames[targetRecord.month - 1],
                round: targetRecord.round,
                roundName: targetRecord.roundName,
                payPeriodStart: targetRecord.payPeriodStart,
                payPeriodEnd: targetRecord.payPeriodEnd,
                grossIncome,
                totalDeductions,
                netPayout,
                thaiBahtNetPayout: thaiBahtText(netPayout),
                incomes,
                deductions,
                ytd: {
                    grossIncome: ytdGross,
                    totalDeductions: ytdDeductions,
                    netPayout: ytdGross - ytdDeductions,
                    tax: ytdTax,
                    socialSecurity: ytdSso,
                    gpf: ytdGpf
                }
            }
        };
    }
};
exports.TaxReportsService = TaxReportsService;
exports.TaxReportsService = TaxReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaxReportsService);
//# sourceMappingURL=tax-reports.service.js.map