const fs = require('fs');
let file = 'src/payroll/payroll.service.ts';
let content = fs.readFileSync(file, 'utf8');

const newMethods = `
  async notifyAll(title: string, message: string) {
    // We can just create a notification with userId: null and have the frontend fetch it for everyone
    await this.prisma.notification.create({
      data: {
        title,
        message,
        userId: null // global
      }
    });
  }

  async notifyRole(roleName: string, title: string, message: string) {
    const roles = await this.prisma.userRole.findMany({
      where: { role: { name: roleName } },
      select: { userId: true }
    });
    const userIds = roles.map(r => r.userId);
    if (userIds.length > 0) {
      await this.prisma.notification.createMany({
        data: userIds.map(id => ({
          userId: id,
          title,
          message,
          roleName
        }))
      });
    }
  }

  async requestApproval(recordId: string, userId: string) {
    const record = await this.prisma.payrollRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Record not found');
    if (record.status !== 'DRAFT') throw new BadRequestException('Only DRAFT can request approval');

    await this.prisma.payrollRecord.update({
      where: { id: recordId },
      data: { status: 'PENDING_APPROVAL' }
    });
    
    await this.prisma.auditLog.create({
      data: { action: 'REQUEST_APPROVAL', tableName: 'PayrollRecord', recordId, userId }
    });

    const monthStr = \`\${record.month}/\${record.year}\`;
    await this.notifyRole('Executive', 'รอการอนุมัติเงินเดือน', \`รอบเงินเดือน \${monthStr} รอการอนุมัติ\`);

    return { message: 'Approval requested' };
  }

  async approvePayroll(recordId: string, userId: string) {
    const record = await this.prisma.payrollRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Record not found');
    
    await this.prisma.payrollRecord.update({
      where: { id: recordId },
      data: { status: 'APPROVED', approvedById: userId }
    });
    
    await this.prisma.auditLog.create({
      data: { action: 'APPROVE_PAYROLL', tableName: 'PayrollRecord', recordId, userId }
    });

    const monthStr = \`\${record.month}/\${record.year}\`;
    await this.notifyAll('เงินเดือนอนุมัติแล้ว', \`รอบเงินเดือน \${monthStr} ได้รับการอนุมัติแล้ว\`);

    return { message: 'Payroll approved' };
  }

  async requestEdit(recordId: string, userId: string, reason: string) {
    const record = await this.prisma.payrollRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Record not found');
    if (record.status !== 'APPROVED') throw new BadRequestException('Only APPROVED can request edit');

    await this.prisma.payrollRecord.update({
      where: { id: recordId },
      data: { 
        status: 'EDIT_REQUESTED',
        editRequestReason: reason,
        editRequestedAt: new Date()
      }
    });

    await this.prisma.auditLog.create({
      data: { action: 'REQUEST_EDIT', tableName: 'PayrollRecord', recordId, userId, reason }
    });

    const monthStr = \`\${record.month}/\${record.year}\`;
    await this.notifyRole('Executive', 'คำร้องขอแก้ไขเงินเดือน', \`มีการขอแก้ไขรอบเงินเดือน \${monthStr} เหตุผล: \${reason}\`);

    return { message: 'Edit requested' };
  }

  async grantEdit(recordId: string, userId: string) {
    const record = await this.prisma.payrollRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Record not found');
    if (record.status !== 'EDIT_REQUESTED') throw new BadRequestException('No edit requested');

    await this.prisma.payrollRecord.update({
      where: { id: recordId },
      data: { 
        status: 'DRAFT',
        editRequestReason: null,
        editRequestedAt: null
      }
    });

    await this.prisma.auditLog.create({
      data: { action: 'GRANT_EDIT', tableName: 'PayrollRecord', recordId, userId }
    });

    return { message: 'Edit granted' };
  }
`;

content = content.replace(
  /async approvePayroll\(recordId: string, userId: string\) \{[\s\S]*?return \{ message: 'Payroll approved' \};\n  \}/,
  newMethods
);

// We need to also patch the PUT transactions to prevent edits if not DRAFT.
const putTransactionsCheck = `
    const record = await this.prisma.payrollRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Record not found');
    if (record.status !== 'DRAFT') throw new BadRequestException('Cannot edit non-draft payroll');
`;

content = content.replace(
  /async updateTransactions\(recordId: string, dto: UpdateTransactionsDto, userId: string\) \{\n/,
  `async updateTransactions(recordId: string, dto: UpdateTransactionsDto, userId: string) {\n${putTransactionsCheck}\n`
);

fs.writeFileSync(file, content);
console.log('Updated payroll.service.ts');
