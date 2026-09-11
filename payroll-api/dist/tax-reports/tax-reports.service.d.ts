import { PrismaService } from '../prisma/prisma.service';
export declare function thaiBahtText(num: number | string): string;
export declare class TaxReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    private hospitalInfo;
    resolveEmployee(userId: string, employeeId?: string): Promise<({
        employeeType: {
            name: string;
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        } | null;
        position: {
            name: string;
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            departmentId: string | null;
            description: string | null;
        } | null;
        department: {
            name: string;
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        } | null;
    } & {
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        employeeCode: string;
        firstName: string;
        lastName: string;
        idCard: string | null;
        bankAccount: string | null;
        bankName: string | null;
        baseSalary: import("@prisma/client-runtime-utils").Decimal | null;
        startDate: Date | null;
        endDate: Date | null;
        departmentId: string | null;
        positionId: string | null;
        employeeTypeId: string | null;
    }) | null>;
    get50Tawi(employeeId: string, year: number): Promise<{
        taxYear: number;
        ceYear: number;
        payer: {
            name: string;
            taxId: string;
            address: string;
            phone: string;
            directorTitle: string;
        };
        payee: {
            id: string;
            employeeCode: string;
            fullName: string;
            idCard: string;
            department: string;
            position: string;
            employeeType: string;
            bankAccount: string | null;
            bankName: string | null;
        };
        incomeSections: {
            sec40_1: {
                name: string;
                payDate: string;
                amount: number;
                taxWithheld: number;
            };
            sec40_2: {
                name: string;
                payDate: string;
                amount: number;
                taxWithheld: number;
            };
            sec40_6: {
                name: string;
                payDate: string;
                amount: number;
                taxWithheld: number;
            };
        };
        funds: {
            socialSecurity: number;
            gpfOrProvidentFund: number;
            totalFunds: number;
        };
        summary: {
            totalIncome: number;
            totalTaxWithheld: number;
            thaiBahtTotalIncome: string;
            thaiBahtTotalTax: string;
            withholdingCondition: string;
        };
        monthlyBreakdown: any[];
        issuedDate: string;
    }>;
    getMyPayslips(userId: string, query: {
        year?: number;
        month?: number;
        round?: number;
        employeeId?: string;
    }): Promise<{
        employee: {
            id: string;
            employeeCode: string;
            fullName: string;
            idCard: string | null;
            department: string;
            position: string;
            employeeType: string;
            bankAccount: string | null;
            bankName: string | null;
            baseSalary: number;
        };
        hasRecords: boolean;
        availableRecords: never[];
        currentPayslip: null;
    } | {
        hasRecords: boolean;
        employee: {
            id: string;
            employeeCode: string;
            fullName: string;
            idCard: string | null;
            department: string;
            position: string;
            employeeType: string;
            bankAccount: string | null;
            bankName: string | null;
            baseSalary: number;
        };
        availableRecords: {
            id: string;
            year: number;
            thaiYear: number;
            month: number;
            monthName: string;
            round: number;
            roundName: string | null;
            label: string;
        }[];
        currentPayslip: {
            recordId: string;
            year: number;
            thaiYear: number;
            month: number;
            monthName: string;
            round: number;
            roundName: string | null;
            payPeriodStart: Date | null;
            payPeriodEnd: Date | null;
            grossIncome: number;
            totalDeductions: number;
            netPayout: number;
            thaiBahtNetPayout: string;
            incomes: any[];
            deductions: any[];
            ytd: {
                grossIncome: number;
                totalDeductions: number;
                netPayout: number;
                tax: number;
                socialSecurity: number;
                gpf: number;
            };
        };
    }>;
}
