import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    client: PrismaClient;
    user: PrismaClient['user'];
    role: PrismaClient['role'];
    employee: PrismaClient['employee'];
    payItem: PrismaClient['payItem'];
    payrollRecord: PrismaClient['payrollRecord'];
    payrollTransaction: PrismaClient['payrollTransaction'];
    auditLog: PrismaClient['auditLog'];
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
