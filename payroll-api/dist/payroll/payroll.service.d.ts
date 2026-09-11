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
        eligibleEmployeesCount: number;
    }>;
    getHeadcountSummary(recordId: string): Promise<{
        currentRecordId: string;
        payPeriodStart: Date | null;
        payPeriodEnd: Date | null;
        totalCurrentCount: number;
        newHiresCount: number;
        newHires: {
            id: string;
            employeeCode: string;
            fullName: string;
            position: string;
            department: string;
            startDate: Date | null;
        }[];
        resignedCount: number;
        resigned: {
            id: any;
            employeeCode: any;
            fullName: string;
            position: any;
            department: any;
            endDate: any;
            status: any;
        }[];
        continuousCount: number;
        previousRecord: {
            id: string;
            month: number;
            year: number;
            round: number;
            roundName: string | null;
            totalCount: number;
        } | null;
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
        payPeriodStart: Date | null;
        payPeriodEnd: Date | null;
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
    requestEdit(recordId: string, reason: string, userId: string): Promise<{
        message: string;
    }>;
    grantEdit(recordId: string, userId: string): Promise<{
        message: string;
    }>;
    rejectEdit(recordId: string, userId: string, rejectReason?: string): Promise<{
        message: string;
    }>;
    getPayrollAuditLogs(recordId: string): Promise<({
        user: {
            employee: {
                employeeCode: string;
                firstName: string;
                lastName: string;
            } | null;
            id: string;
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
    deletePayrollRecord(recordId: string, userId: string): Promise<{
        message: string;
    }>;
    exportExcel(recordId: string, res: Response, employeeIds?: string[]): Promise<void>;
    getAccumulatedTotalsForRecord(recordId: string, employeeIds?: string[]): Promise<Record<string, Record<string, {
        label: string;
        amount: number;
        type: string;
    }>>>;
    exportPdf(recordId: string, res: Response, employeeIds?: string[]): Promise<void>;
}
