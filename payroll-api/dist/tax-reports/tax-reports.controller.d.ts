import { TaxReportsService } from './tax-reports.service';
export declare class TaxReportsController {
    private readonly taxReportsService;
    constructor(taxReportsService: TaxReportsService);
    getMyPayslips(req: any, year?: number, month?: number, round?: number, employeeId?: string): Promise<{
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
    getMy50Tawi(req: any, year?: number, employeeId?: string): Promise<{
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
    get50TawiByEmployee(employeeId: string, year?: number): Promise<{
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
}
