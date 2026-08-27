import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding test users...');
  
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const testUsers = [
    { username: 'admin', roleName: 'System Administrator', email: 'admin@samkok.go.th' },
    { username: 'finance', roleName: 'Finance Officer', email: 'finance@samkok.go.th' },
    { username: 'executive', roleName: 'Executive', email: 'exec@samkok.go.th' },
    { username: 'emp01', roleName: 'Employee', email: 'emp01@samkok.go.th' },
  ];

  for (const t of testUsers) {
    const role = await prisma.role.findUnique({ where: { name: t.roleName } });
    if (!role) {
      console.error(`Role ${t.roleName} not found!`);
      continue;
    }

    const user = await prisma.user.upsert({
      where: { username: t.username },
      update: { passwordHash },
      create: {
        username: t.username,
        email: t.email,
        passwordHash,
        roles: {
          create: {
            roleId: role.id
          }
        }
      }
    });
    console.log(`User ${t.username} seeded.`);
  }

  console.log('Finished seeding users.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
