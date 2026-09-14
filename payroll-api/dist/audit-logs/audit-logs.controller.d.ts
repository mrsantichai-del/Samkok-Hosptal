import { AuditLogsService, AuditQueryDto } from './audit-logs.service';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
    findAll(query: AuditQueryDto): Promise<{
        data: ({
            user: {
                employee: {
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
                    id: string;
                    employeeCode: string;
                    firstName: string;
                    lastName: string;
                } | null;
                id: string;
                username: string;
                imgUrl: string | null;
                roles: ({
                    role: {
                        name: string;
                        id: string;
                        deletedAt: Date | null;
                        createdAt: Date;
                        updatedAt: Date;
                        description: string | null;
                    };
                } & {
                    id: string;
                    deletedAt: Date | null;
                    createdAt: Date;
                    userId: string;
                    roleId: string;
                })[];
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
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStats(): Promise<{
        totalLogs: number;
        todayLogs: number;
        printLogs: number;
        approveLogs: number;
        topActiveUsersCount: number;
    }>;
    logEvent(body: any, req: any): Promise<{
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
    }>;
}
