import { PayrollService } from './payroll.service';
import { ProcessPayrollDto } from './dto/process-payroll.dto';
import type { Response } from 'express';
export declare class PayrollController {
    private readonly payrollService;
    constructor(payrollService: PayrollService);
    processPayroll(processPayrollDto: ProcessPayrollDto, req: any): Promise<{
        message: string;
        recordId: string;
        count: number;
    }>;
    getRecords(): Promise<{
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        month: number;
        year: number;
        status: string;
        notes: string | null;
    }[]>;
    getTransactions(id: string, employeeId?: string): Promise<({
        employee: {
            employeeCode: string;
            firstName: string;
            lastName: string;
            position: {
                name: string;
            } | null;
        };
        payItem: {
            name: string;
            type: import("@prisma/client").$Enums.PayItemType;
        };
    } & {
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        payrollRecordId: string;
        payItemId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        formulaUsed: string | null;
    })[]>;
    updateEmployeeTransactions(id: string, empId: string, body: {
        transactions: {
            payItemId: string;
            amount: number;
        }[];
    }, req: any): Promise<{
        message: string;
    }>;
    approvePayroll(id: string, req: any): Promise<{
        message: string;
    }>;
    exportExcel(id: string, res: Response): Promise<void>;
    exportPdf(id: string, res: Response): Promise<void>;
}
