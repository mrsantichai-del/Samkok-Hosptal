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
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        month: number;
        year: number;
        status: string;
        notes: string | null;
        approvedById: string | null;
        editRequestReason: string | null;
        editRequestedAt: Date | null;
    }[]>;
    getPayrollRecordById(id: string): Promise<{
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        month: number;
        year: number;
        status: string;
        notes: string | null;
        approvedById: string | null;
        editRequestReason: string | null;
        editRequestedAt: Date | null;
    }>;
    getAuditLogs(recordId: string): Promise<({
        user: {
            employee: {
                firstName: string;
                lastName: string;
            } | null;
            username: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        action: string;
        tableName: string;
        recordId: string;
        oldData: import("@prisma/client/runtime/client").JsonValue | null;
        newData: import("@prisma/client/runtime/client").JsonValue | null;
        reason: string | null;
        ipAddress: string | null;
    })[]>;
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
    notifyAll(title: string, message: string): Promise<void>;
    notifyRole(roleName: string, title: string, message: string): Promise<void>;
    requestApproval(recordId: string, userId: string): Promise<{
        message: string;
    }>;
    approvePayroll(recordId: string, userId: string): Promise<{
        message: string;
    }>;
    requestEdit(recordId: string, userId: string, reason: string): Promise<{
        message: string;
    }>;
    grantEdit(recordId: string, userId: string): Promise<{
        message: string;
    }>;
    exportExcel(recordId: string, res: Response, employeeIds?: string[]): Promise<void>;
    exportPdf(recordId: string, res: Response, employeeIds?: string[]): Promise<void>;
}
