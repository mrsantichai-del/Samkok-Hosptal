"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const pool = new pg_1.Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Updating roles...');
    const roles = [
        { name: 'System Administrator', description: 'ผู้ดูแลระบบสูงสุด จัดการสิทธิ์และการตั้งค่า' },
        { name: 'Finance Officer', description: 'เจ้าหน้าที่ฝ่ายการเงิน จัดการเงินเดือนและบุคลากร' },
        { name: 'Executive', description: 'ผู้บริหาร พิจารณาและอนุมัติ ดูรายงาน' },
        { name: 'Employee', description: 'บุคลากรทั่วไป ดูสลิปเงินเดือน' }
    ];
    for (const r of roles) {
        await prisma.role.upsert({
            where: { name: r.name },
            update: { description: r.description },
            create: { name: r.name, description: r.description }
        });
    }
    await prisma.role.updateMany({
        where: { name: { in: ['Admin', 'HR'] } },
        data: { deletedAt: new Date() }
    });
    console.log('Roles updated successfully');
}
main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=update-roles.js.map