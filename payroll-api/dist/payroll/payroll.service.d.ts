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
    getPayrollRecords(): Promise<any>;
    getPayrollRecordById(id: string): Promise<{
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        month: number;
        year: number;
        round: number;
        roundName: string | null;
        status: string;
        notes: string | null;
        approvedById: string | null;
        editRequestReason: string | null;
        editRequestedAt: Date | null;
    }>;
    getPayrollTransactions(recordId: string, employeeId?: string): Promise<({
        employee: {
            employeeType: {
                name: string;
                id: string;
            } | null;
            position: {
                name: string;
                id: string;
            } | null;
            employeeCode: string;
            firstName: string;
            lastName: string;
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
    updateEmployeeTransactions(recordId: string, employeeId: string, transactions: {
        payItemId: string;
        amount: number;
    }[], userId: string): Promise<{
        message: string;
    }>;
    requestApproval(recordId: string, userId: string): Promise<{
        message: string;
    }>;
    approvePayroll(recordId: string, userId: string): Promise<{
        message: string;
    }>;
    deletePayrollRecord(recordId: string, userId: string): Promise<{
        message: string;
    }>;
    exportExcel(recordId: string, res: Response, employeeIds?: string[]): Promise<void>;
    exportPdf(recordId: string, res: Response, employeeIds?: string[]): Promise<void>;
}
