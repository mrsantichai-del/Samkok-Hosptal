import { PayrollService } from './payroll.service';
import { ProcessPayrollDto } from './dto/process-payroll.dto';
import type { Response } from 'express';
export declare class PayrollController {
    private readonly payrollService;
    approvePayrollLegacy(id: string, req: any): Promise<{
        message: string;
    }>;
    constructor(payrollService: PayrollService);
    processPayroll(processPayrollDto: ProcessPayrollDto, req: any): Promise<{
        message: string;
        recordId: string;
        count: number;
        eligibleEmployeesCount: number;
    }>;
    getRecords(): Promise<any>;
    getRecordById(id: string): Promise<{
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
    deleteRecord(id: string, req: any): Promise<{
        message: string;
    }>;
    getTransactions(id: string, employeeId?: string): Promise<({
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
    getAuditLogs(id: string): Promise<({
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
    updateEmployeeTransactions(id: string, empId: string, body: {
        transactions: {
            payItemId: string;
            amount: number;
        }[];
    }, req: any): Promise<{
        message: string;
    }>;
    requestApproval(id: string, req: any): Promise<{
        message: string;
    }>;
    approvePayrollExec(id: string, req: any): Promise<{
        message: string;
    }>;
    requestEdit(id: string, body: {
        reason: string;
    }, req: any): Promise<{
        message: string;
    }>;
    grantEdit(id: string, req: any): Promise<{
        message: string;
    }>;
    rejectEdit(id: string, body: {
        reason?: string;
    }, req: any): Promise<{
        message: string;
    }>;
    getAccumulatedTotals(id: string): Promise<Record<string, Record<string, {
        label: string;
        amount: number;
        type: string;
    }>>>;
    getHeadcountSummary(id: string): Promise<{
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
    exportExcel(id: string, body: {
        employeeIds?: string[];
    }, res: Response): Promise<void>;
    exportPdf(id: string, body: {
        employeeIds?: string[];
    }, res: Response): Promise<void>;
}
