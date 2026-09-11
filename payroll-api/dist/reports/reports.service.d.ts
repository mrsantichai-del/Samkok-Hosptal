import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getTargetRecords;
    getExecutiveSummary(query: any): Promise<{
        hasData: boolean;
        message: string;
        recordsCount?: undefined;
        periodLabel?: undefined;
        selectedRecords?: undefined;
        metrics?: undefined;
        comparison?: undefined;
    } | {
        hasData: boolean;
        recordsCount: number;
        periodLabel: string;
        selectedRecords: {
            id: string;
            year: number;
            month: number;
            round: number;
            roundName: string | null;
            payPeriodStart: Date | null;
            payPeriodEnd: Date | null;
            status: string;
        }[];
        metrics: {
            totalNetPayout: number;
            totalGrossIncome: number;
            totalDeductions: number;
            totalHeadcount: number;
            avgGrossPerHead: number;
            avgNetPerHead: number;
            otRatioPercent: number;
            baseSalaryTotal: number;
            otShiftTotal: number;
            specialAllowanceTotal: number;
            otherIncomeTotal: number;
            taxTotal: number;
            ssoTotal: number;
            gpfTotal: number;
            otherDeductionTotal: number;
        };
        comparison: any;
        message?: undefined;
    }>;
    getByDimension(dimension: 'department' | 'position' | 'employeeType' | 'payCategory', query: any): Promise<{
        dimension: "employeeType" | "position" | "department" | "payCategory";
        items: never[];
        grandTotal: {
            gross: number;
            net: number;
            deductions: number;
            headcount: number;
            avgNetPerHead?: undefined;
        };
    } | {
        dimension: "employeeType" | "position" | "department" | "payCategory";
        grandTotal: {
            gross: number;
            deductions: number;
            net: number;
            headcount: number;
            avgNetPerHead: number;
        };
        items: {
            id: string;
            name: string;
            headcount: number;
            totalGross: number;
            totalDeductions: number;
            totalNet: number;
            baseSalary: number;
            otShift: number;
            specialAllowance: number;
            sharePercent: number;
            avgGrossPerHead: number;
            avgNetPerHead: number;
            payItemsBreakdown: {
                id: string;
                name: string;
                type: string;
                amount: number;
            }[];
        }[];
    }>;
    getTimelineTrend(query: any): Promise<{
        period: any;
        dataPoints: any[];
    }>;
    getDrilldownDetails(query: {
        recordId?: string;
        year?: number;
        month?: number;
        round?: number;
        departmentId?: string;
        positionId?: string;
        employeeTypeId?: string;
        payItemId?: string;
    }): Promise<{
        employees: never[];
        summary: {
            totalGross: number;
            totalNet: number;
            count: number;
            totalDeductions?: undefined;
            avgNetPerHead?: undefined;
        };
        count?: undefined;
    } | {
        count: number;
        summary: {
            totalGross: number;
            totalDeductions: number;
            totalNet: number;
            avgNetPerHead: number;
            count?: undefined;
        };
        employees: {
            employeeId: string;
            employeeCode: string;
            firstName: string;
            lastName: string;
            department: string;
            position: string;
            employeeType: string;
            status: string;
            startDate: string | null;
            endDate: string | null;
            baseSalary: number;
            grossIncome: number;
            totalDeductions: number;
            netAmount: number;
            incomes: Record<string, {
                name: string;
                amount: number;
            }>;
            deductions: Record<string, {
                name: string;
                amount: number;
            }>;
        }[];
    }>;
}
