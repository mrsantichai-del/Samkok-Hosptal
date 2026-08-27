import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public client: PrismaClient;
  
  // Expose prisma client properties directly for backward compatibility
  public user: PrismaClient['user'];
  public role: PrismaClient['role'];
  public employee: PrismaClient['employee'];
  public employeeType: PrismaClient['employeeType'];
  public payItem: PrismaClient['payItem'];
  public payrollRecord: PrismaClient['payrollRecord'];
  public payrollTransaction: PrismaClient['payrollTransaction'];
  public auditLog: PrismaClient['auditLog'];

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL });
    const adapter = new PrismaPg(pool);
    this.client = new PrismaClient({ adapter });

    this.user = this.client.user;
    this.role = this.client.role;
    this.employee = this.client.employee;
    this.employeeType = this.client.employeeType;
    this.payItem = this.client.payItem;
    this.payrollRecord = this.client.payrollRecord;
    this.payrollTransaction = this.client.payrollTransaction;
    this.auditLog = this.client.auditLog;
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
