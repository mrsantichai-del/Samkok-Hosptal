import { PrismaService } from '../prisma/prisma.service';
import { ProcessPayrollDto } from './dto/process-payroll.dto';
import type { Response } from 'express';
export declare class PayrollService {
    private prisma;
    constructor(prisma: PrismaService);
    processPayroll(dto: ProcessPayrollDto, userId: string): Promise<{
        message: string;
        recordId: string;
        count: number;
    }>;
    getPayrollRecords(): Promise<{
        id: string;
        month: number;
        year: number;
        status: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }[]>;
    getPayrollTransactions(recordId: string, employeeId?: string): Promise<({
        payItem: {
            name: string;
            type: import("@prisma/client").$Enums.PayItemType;
        };
        employee: {
            employeeCode: string;
            firstName: string;
            lastName: string;
            position: {
                name: string;
            } | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        payrollRecordId: string;
        employeeId: string;
        payItemId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        formulaUsed: string | null;
    })[]>;
    updateEmployeeTransactions(recordId: string, employeeId: string, transactions: {
        payItemId: string;
        amount: number;
    }[], userId: string): Promise<{
        message: string;
    }>;
    approvePayroll(recordId: string, userId: string): Promise<{
        message: string;
    }>;
    exportExcel(recordId: string, res: Response): Promise<void>;
    exportPdf(recordId: string, res: Response): Promise<void>;
}
