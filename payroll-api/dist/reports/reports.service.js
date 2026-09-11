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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTargetRecords(query) {
        const { year, month, round, periodType = 'latest', quarter, fiscalYear, startDate, endDate } = query;
        if (periodType === 'latest' || (!year && !periodType)) {
            const latest = await this.prisma.payrollRecord.findFirst({
                where: { deletedAt: null },
                orderBy: [{ year: 'desc' }, { month: 'desc' }, { round: 'desc' }]
            });
            return latest ? [latest] : [];
        }
        if (periodType === 'monthly') {
            const where = { deletedAt: null };
            if (year)
                where.year = Number(year);
            if (month)
                where.month = Number(month);
            if (round)
                where.round = Number(round);
            return await this.prisma.payrollRecord.findMany({
                where,
                orderBy: [{ year: 'desc' }, { month: 'desc' }, { round: 'desc' }]
            });
        }
        if (periodType === 'quarterly' && year && quarter) {
            const q = Number(quarter);
            const months = q === 1 ? [1, 2, 3] : q === 2 ? [4, 5, 6] : q === 3 ? [7, 8, 9] : [10, 11, 12];
            return await this.prisma.payrollRecord.findMany({
                where: {
                    year: Number(year),
                    month: { in: months },
                    deletedAt: null
                },
                orderBy: [{ month: 'asc' }, { round: 'asc' }]
            });
        }
        if (periodType === 'fiscalYear') {
            let ceYear = Number(fiscalYear || year || new Date().getFullYear());
            if (ceYear > 2400)
                ceYear -= 543;
            return await this.prisma.payrollRecord.findMany({
                where: {
                    deletedAt: null,
                    OR: [
                        { year: ceYear - 1, month: { in: [10, 11, 12] } },
                        { year: ceYear, month: { in: [1, 2, 3, 4, 5, 6, 7, 8, 9] } }
                    ]
                },
                orderBy: [{ year: 'asc' }, { month: 'asc' }, { round: 'asc' }]
            });
        }
        if (periodType === 'calendarYear') {
            let ceYear = Number(year || new Date().getFullYear());
            if (ceYear > 2400)
                ceYear -= 543;
            return await this.prisma.payrollRecord.findMany({
                where: { year: ceYear, deletedAt: null },
                orderBy: [{ month: 'asc' }, { round: 'asc' }]
            });
        }
        if (periodType === 'custom' && startDate && endDate) {
            const s = new Date(startDate);
            const e = new Date(endDate);
            return await this.prisma.payrollRecord.findMany({
                where: {
                    deletedAt: null,
                    payPeriodStart: { lte: e },
                    payPeriodEnd: { gte: s }
                },
                orderBy: [{ year: 'asc' }, { month: 'asc' }, { round: 'asc' }]
            });
        }
        return await this.prisma.payrollRecord.findMany({
            where: { deletedAt: null },
            orderBy: [{ year: 'desc' }, { month: 'desc' }, { round: 'desc' }],
            take: 1
        });
    }
    async getExecutiveSummary(query) {
        const records = await this.getTargetRecords(query);
        if (records.length === 0) {
            return {
                hasData: false,
                message: 'ไม่พบข้อมูลงวดเงินเดือนในช่วงเวลาที่เลือก'
            };
        }
        const recordIds = records.map(r => r.id);
        const [transactions, prevRecord] = await Promise.all([
            this.prisma.payrollTransaction.findMany({
                where: { payrollRecordId: { in: recordIds } },
                select: {
                    employeeId: true,
                    amount: true,
                    payItem: {
                        select: { name: true, type: true }
                    }
                }
            }),
            records[0] ? this.prisma.payrollRecord.findFirst({
                where: {
                    deletedAt: null,
                    OR: [
                        { year: { lt: records[0].year } },
                        { year: records[0].year, month: { lt: records[0].month } },
                        { year: records[0].year, month: records[0].month, round: { lt: records[0].round } }
                    ]
                },
                orderBy: [{ year: 'desc' }, { month: 'desc' }, { round: 'desc' }]
            }) : Promise.resolve(null)
        ]);
        const distinctEmpIds = new Set();
        let totalGrossIncome = 0;
        let totalDeductions = 0;
        let baseSalaryTotal = 0;
        let otShiftTotal = 0;
        let specialAllowanceTotal = 0;
        let otherIncomeTotal = 0;
        let taxTotal = 0;
        let ssoTotal = 0;
        let gpfTotal = 0;
        let otherDeductionTotal = 0;
        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            distinctEmpIds.add(tx.employeeId);
            const amt = Number(tx.amount) || 0;
            const itemName = (tx.payItem?.name || '').toLowerCase();
            const isIncome = tx.payItem?.type === 'INCOME';
            if (isIncome) {
                totalGrossIncome += amt;
                if (itemName.includes('เงินเดือน') || itemName.includes('ค่าจ้าง')) {
                    baseSalaryTotal += amt;
                }
                else if (itemName.includes('ot') || itemName.includes('ล่วงเวลา') || itemName.includes('ค่าเวร') || itemName.includes('บ่าย') || itemName.includes('ดึก')) {
                    otShiftTotal += amt;
                }
                else if (itemName.includes('พ.ต.ส') || itemName.includes('พตส') || itemName.includes('เบี้ยเลี้ยง') || itemName.includes('ไม่ทำเวช') || itemName.includes('พิเศษ')) {
                    specialAllowanceTotal += amt;
                }
                else {
                    otherIncomeTotal += amt;
                }
            }
            else {
                totalDeductions += amt;
                if (itemName.includes('ภาษี') || itemName.includes('tax')) {
                    taxTotal += amt;
                }
                else if (itemName.includes('ประกันสังคม') || itemName.includes('สปส')) {
                    ssoTotal += amt;
                }
                else if (itemName.includes('กบข') || itemName.includes('กสจ') || itemName.includes('สะสม')) {
                    gpfTotal += amt;
                }
                else {
                    otherDeductionTotal += amt;
                }
            }
        }
        const totalHeadcount = distinctEmpIds.size;
        const totalNetPayout = totalGrossIncome - totalDeductions;
        const avgGrossPerHead = totalHeadcount > 0 ? Math.round(totalGrossIncome / totalHeadcount) : 0;
        const avgNetPerHead = totalHeadcount > 0 ? Math.round(totalNetPayout / totalHeadcount) : 0;
        const otRatio = baseSalaryTotal > 0 ? Number(((otShiftTotal / baseSalaryTotal) * 100).toFixed(1)) : 0;
        let previousSummary = null;
        if (prevRecord) {
            const prevTxs = await this.prisma.payrollTransaction.findMany({
                where: { payrollRecordId: prevRecord.id },
                select: {
                    employeeId: true,
                    amount: true,
                    payItem: { select: { type: true } }
                }
            });
            const prevDistinctEmps = new Set(prevTxs.map(t => t.employeeId));
            let prevGross = 0;
            let prevDed = 0;
            for (let i = 0; i < prevTxs.length; i++) {
                const t = prevTxs[i];
                const a = Number(t.amount) || 0;
                if (t.payItem?.type === 'INCOME')
                    prevGross += a;
                else
                    prevDed += a;
            }
            const prevNet = prevGross - prevDed;
            previousSummary = {
                recordId: prevRecord.id,
                year: prevRecord.year,
                month: prevRecord.month,
                round: prevRecord.round,
                roundName: prevRecord.roundName,
                totalHeadcount: prevDistinctEmps.size,
                totalNetPayout: prevNet,
                totalGrossIncome: prevGross,
                totalDeductions: prevDed,
                netChangePercent: prevNet > 0 ? Number((((totalNetPayout - prevNet) / prevNet) * 100).toFixed(1)) : 0,
                headcountChange: totalHeadcount - prevDistinctEmps.size
            };
        }
        const primaryRecord = records[0];
        return {
            hasData: true,
            recordsCount: records.length,
            periodLabel: records.length === 1
                ? "เดือน " + primaryRecord.month + "/" + (primaryRecord.year + 543) + " (" + (primaryRecord.roundName || "งวดที่ " + primaryRecord.round) + ")"
                : "ช่วงเวลา (" + records.length + " งวด)",
            selectedRecords: records.map(r => ({
                id: r.id,
                year: r.year,
                month: r.month,
                round: r.round,
                roundName: r.roundName,
                payPeriodStart: r.payPeriodStart,
                payPeriodEnd: r.payPeriodEnd,
                status: r.status
            })),
            metrics: {
                totalNetPayout,
                totalGrossIncome,
                totalDeductions,
                totalHeadcount,
                avgGrossPerHead,
                avgNetPerHead,
                otRatioPercent: otRatio,
                baseSalaryTotal,
                otShiftTotal,
                specialAllowanceTotal,
                otherIncomeTotal,
                taxTotal,
                ssoTotal,
                gpfTotal,
                otherDeductionTotal
            },
            comparison: previousSummary
        };
    }
    async getByDimension(dimension, query) {
        const records = await this.getTargetRecords(query);
        if (records.length === 0)
            return { dimension, items: [], grandTotal: { gross: 0, net: 0, deductions: 0, headcount: 0 } };
        const recordIds = records.map(r => r.id);
        const transactions = await this.prisma.payrollTransaction.findMany({
            where: { payrollRecordId: { in: recordIds } },
            select: {
                employeeId: true,
                amount: true,
                payItemId: true,
                payItem: {
                    select: { id: true, name: true, type: true }
                },
                employee: {
                    select: {
                        departmentId: true,
                        positionId: true,
                        employeeTypeId: true,
                        department: { select: { name: true } },
                        position: { select: { name: true } },
                        employeeType: { select: { name: true } }
                    }
                }
            }
        });
        const groupsMap = new Map();
        let grandGross = 0;
        let grandDed = 0;
        const grandEmpIds = new Set();
        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            const amt = Number(tx.amount) || 0;
            const isIncome = tx.payItem?.type === 'INCOME';
            const itemName = (tx.payItem?.name || '').toLowerCase();
            if (isIncome)
                grandGross += amt;
            else
                grandDed += amt;
            grandEmpIds.add(tx.employeeId);
            let groupId = 'unassigned';
            let groupName = 'ไม่ระบุ';
            if (dimension === 'department') {
                groupId = tx.employee?.departmentId || 'unassigned';
                groupName = tx.employee?.department?.name || 'ไม่ระบุกลุ่มงาน';
            }
            else if (dimension === 'position') {
                groupId = tx.employee?.positionId || 'unassigned';
                groupName = tx.employee?.position?.name || 'ไม่ระบุตำแหน่ง';
            }
            else if (dimension === 'employeeType') {
                groupId = tx.employee?.employeeTypeId || 'unassigned';
                groupName = tx.employee?.employeeType?.name || 'ไม่ระบุประเภท';
            }
            else if (dimension === 'payCategory') {
                if (isIncome) {
                    if (itemName.includes('เงินเดือน') || itemName.includes('ค่าจ้าง')) {
                        groupId = 'BASE_SALARY';
                        groupName = 'เงินเดือนและค่าจ้างพื้นฐาน';
                    }
                    else if (itemName.includes('ot') || itemName.includes('ล่วงเวลา') || itemName.includes('เวร')) {
                        groupId = 'OT_SHIFT';
                        groupName = 'ค่าตอบแทนเวรและล่วงเวลา (OT)';
                    }
                    else if (itemName.includes('พ.ต.ส') || itemName.includes('พตส') || itemName.includes('เบี้ยเลี้ยง') || itemName.includes('ไม่ทำเวช') || itemName.includes('พิเศษ')) {
                        groupId = 'SPECIAL_ALLOWANCE';
                        groupName = 'เงินเพิ่มพิเศษวิชาชีพ (พ.ต.ส./ไม่ทำเวชฯ)';
                    }
                    else {
                        groupId = 'OTHER_INCOME';
                        groupName = 'เงินได้อื่นๆ';
                    }
                }
                else {
                    if (itemName.includes('ภาษี')) {
                        groupId = 'TAX';
                        groupName = 'ภาษีหัก ณ ที่จ่าย';
                    }
                    else if (itemName.includes('ประกันสังคม')) {
                        groupId = 'SSO';
                        groupName = 'เงินสมทบประกันสังคม';
                    }
                    else if (itemName.includes('กบข') || itemName.includes('กสจ')) {
                        groupId = 'GPF';
                        groupName = 'เงินสะสม กบข./กสจ.';
                    }
                    else {
                        groupId = 'OTHER_DEDUCTION';
                        groupName = 'เงินหักอื่นๆ';
                    }
                }
            }
            if (!groupsMap.has(groupId)) {
                groupsMap.set(groupId, {
                    id: groupId,
                    name: groupName,
                    empIds: new Set(),
                    gross: 0,
                    deductions: 0,
                    baseSalary: 0,
                    otShift: 0,
                    specialAllowance: 0,
                    payItemsMap: new Map()
                });
            }
            const g = groupsMap.get(groupId);
            g.empIds.add(tx.employeeId);
            if (isIncome) {
                g.gross += amt;
                if (itemName.includes('เงินเดือน') || itemName.includes('ค่าจ้าง'))
                    g.baseSalary += amt;
                else if (itemName.includes('ot') || itemName.includes('ล่วงเวลา') || itemName.includes('เวร'))
                    g.otShift += amt;
                else if (itemName.includes('พ.ต.ส') || itemName.includes('พตส') || itemName.includes('เบี้ยเลี้ยง') || itemName.includes('ไม่ทำเวช'))
                    g.specialAllowance += amt;
            }
            else {
                g.deductions += amt;
            }
            if (tx.payItem) {
                if (!g.payItemsMap.has(tx.payItemId)) {
                    g.payItemsMap.set(tx.payItemId, {
                        id: tx.payItemId,
                        name: tx.payItem.name,
                        type: tx.payItem.type,
                        amount: 0
                    });
                }
                g.payItemsMap.get(tx.payItemId).amount += amt;
            }
        }
        const grandNet = grandGross - grandDed;
        const items = Array.from(groupsMap.values()).map(g => {
            const net = g.gross - g.deductions;
            const headcount = g.empIds.size;
            const sharePercent = grandGross > 0 ? Number(((g.gross / grandGross) * 100).toFixed(1)) : 0;
            const avgGross = headcount > 0 ? Math.round(g.gross / headcount) : 0;
            const avgNet = headcount > 0 ? Math.round(net / headcount) : 0;
            return {
                id: g.id,
                name: g.name,
                headcount,
                totalGross: g.gross,
                totalDeductions: g.deductions,
                totalNet: net,
                baseSalary: g.baseSalary,
                otShift: g.otShift,
                specialAllowance: g.specialAllowance,
                sharePercent,
                avgGrossPerHead: avgGross,
                avgNetPerHead: avgNet,
                payItemsBreakdown: Array.from(g.payItemsMap.values()).sort((a, b) => b.amount - a.amount)
            };
        }).sort((a, b) => b.totalGross - a.totalGross);
        return {
            dimension,
            grandTotal: {
                gross: grandGross,
                deductions: grandDed,
                net: grandNet,
                headcount: grandEmpIds.size,
                avgNetPerHead: grandEmpIds.size > 0 ? Math.round(grandNet / grandEmpIds.size) : 0
            },
            items
        };
    }
    async getTimelineTrend(query) {
        const { period = 'last12Months', year } = query;
        let targetRecords = [];
        if (period === 'fiscalYear') {
            let ceYear = Number(year || new Date().getFullYear());
            if (ceYear > 2400)
                ceYear -= 543;
            targetRecords = await this.prisma.payrollRecord.findMany({
                where: {
                    deletedAt: null,
                    OR: [
                        { year: ceYear - 1, month: { in: [10, 11, 12] } },
                        { year: ceYear, month: { in: [1, 2, 3, 4, 5, 6, 7, 8, 9] } }
                    ]
                },
                orderBy: [{ year: 'asc' }, { month: 'asc' }, { round: 'asc' }]
            });
        }
        else {
            targetRecords = await this.prisma.payrollRecord.findMany({
                where: { deletedAt: null },
                orderBy: [{ year: 'desc' }, { month: 'desc' }, { round: 'desc' }],
                take: 12
            });
            targetRecords.reverse();
        }
        if (targetRecords.length === 0) {
            return { period, dataPoints: [] };
        }
        const targetRecordIds = targetRecords.map(r => r.id);
        const allTxs = await this.prisma.payrollTransaction.findMany({
            where: { payrollRecordId: { in: targetRecordIds } },
            select: {
                payrollRecordId: true,
                employeeId: true,
                amount: true,
                payItem: { select: { name: true, type: true } }
            }
        });
        const txByRecord = new Map();
        for (let i = 0; i < allTxs.length; i++) {
            const tx = allTxs[i];
            if (!txByRecord.has(tx.payrollRecordId)) {
                txByRecord.set(tx.payrollRecordId, []);
            }
            txByRecord.get(tx.payrollRecordId).push(tx);
        }
        const monthNamesShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const dataPoints = [];
        for (let r = 0; r < targetRecords.length; r++) {
            const rec = targetRecords[r];
            const txs = txByRecord.get(rec.id) || [];
            const empIds = new Set();
            let gross = 0;
            let ded = 0;
            let base = 0;
            let ot = 0;
            let special = 0;
            for (let i = 0; i < txs.length; i++) {
                const t = txs[i];
                empIds.add(t.employeeId);
                const amt = Number(t.amount) || 0;
                const itemName = (t.payItem?.name || '').toLowerCase();
                if (t.payItem?.type === 'INCOME') {
                    gross += amt;
                    if (itemName.includes('เงินเดือน') || itemName.includes('ค่าจ้าง'))
                        base += amt;
                    else if (itemName.includes('ot') || itemName.includes('ล่วงเวลา') || itemName.includes('เวร'))
                        ot += amt;
                    else if (itemName.includes('พ.ต.ส') || itemName.includes('พตส') || itemName.includes('เบี้ยเลี้ยง') || itemName.includes('ไม่ทำเวช'))
                        special += amt;
                }
                else {
                    ded += amt;
                }
            }
            const thaiYearShort = String(rec.year + 543).slice(-2);
            const label = monthNamesShort[rec.month - 1] + ' ' + thaiYearShort;
            dataPoints.push({
                recordId: rec.id,
                year: rec.year,
                month: rec.month,
                round: rec.round,
                label,
                fullLabel: monthNamesShort[rec.month - 1] + ' ' + (rec.year + 543) + ' (' + (rec.roundName || 'งวด ' + rec.round) + ')',
                headcount: empIds.size,
                gross,
                deductions: ded,
                net: gross - ded,
                baseSalary: base,
                otShift: ot,
                specialAllowance: special
            });
        }
        return {
            period,
            dataPoints
        };
    }
    async getDrilldownDetails(query) {
        const { recordId, year, month, round, departmentId, positionId, employeeTypeId, payItemId } = query;
        let targetRecordIds = [];
        if (recordId) {
            targetRecordIds = [recordId];
        }
        else {
            const records = await this.getTargetRecords({ year, month, round, periodType: year && month ? 'monthly' : 'latest' });
            targetRecordIds = records.map(r => r.id);
        }
        if (targetRecordIds.length === 0)
            return { employees: [], summary: { totalGross: 0, totalNet: 0, count: 0 } };
        const empWhere = { deletedAt: null };
        if (departmentId && departmentId !== 'all' && departmentId !== 'unassigned')
            empWhere.departmentId = departmentId;
        if (positionId && positionId !== 'all' && positionId !== 'unassigned')
            empWhere.positionId = positionId;
        if (employeeTypeId && employeeTypeId !== 'all' && employeeTypeId !== 'unassigned')
            empWhere.employeeTypeId = employeeTypeId;
        const txWhere = {
            payrollRecordId: { in: targetRecordIds }
        };
        if (payItemId && payItemId !== 'all') {
            txWhere.payItemId = payItemId;
        }
        const transactions = await this.prisma.payrollTransaction.findMany({
            where: {
                ...txWhere,
                employee: empWhere
            },
            select: {
                amount: true,
                payItemId: true,
                payItem: {
                    select: { id: true, name: true, type: true }
                },
                employee: {
                    select: {
                        id: true,
                        employeeCode: true,
                        firstName: true,
                        lastName: true,
                        status: true,
                        startDate: true,
                        endDate: true,
                        baseSalary: true,
                        department: { select: { name: true } },
                        position: { select: { name: true } },
                        employeeType: { select: { name: true } }
                    }
                }
            }
        });
        const empMap = new Map();
        let grandGross = 0;
        let grandDed = 0;
        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            const emp = tx.employee;
            const amt = Number(tx.amount) || 0;
            const isIncome = tx.payItem?.type === 'INCOME';
            if (!empMap.has(emp.id)) {
                empMap.set(emp.id, {
                    employeeId: emp.id,
                    employeeCode: emp.employeeCode,
                    firstName: emp.firstName,
                    lastName: emp.lastName,
                    department: emp.department?.name || '-',
                    position: emp.position?.name || '-',
                    employeeType: emp.employeeType?.name || '-',
                    status: emp.status,
                    startDate: emp.startDate ? emp.startDate.toISOString().split('T')[0] : null,
                    endDate: emp.endDate ? emp.endDate.toISOString().split('T')[0] : null,
                    baseSalary: Number(emp.baseSalary) || 0,
                    grossIncome: 0,
                    totalDeductions: 0,
                    netAmount: 0,
                    incomes: {},
                    deductions: {}
                });
            }
            const eData = empMap.get(emp.id);
            if (isIncome) {
                eData.grossIncome += amt;
                grandGross += amt;
                if (tx.payItem) {
                    eData.incomes[tx.payItemId] = { name: tx.payItem.name, amount: amt };
                }
            }
            else {
                eData.totalDeductions += amt;
                grandDed += amt;
                if (tx.payItem) {
                    eData.deductions[tx.payItemId] = { name: tx.payItem.name, amount: amt };
                }
            }
            eData.netAmount = eData.grossIncome - eData.totalDeductions;
        }
        const employees = Array.from(empMap.values()).sort((a, b) => a.employeeCode.localeCompare(b.employeeCode));
        return {
            count: employees.length,
            summary: {
                totalGross: grandGross,
                totalDeductions: grandDed,
                totalNet: grandGross - grandDed,
                avgNetPerHead: employees.length > 0 ? Math.round((grandGross - grandDed) / employees.length) : 0
            },
            employees
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map