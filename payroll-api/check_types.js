const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

prisma.employeeType.findMany().then(types => {
  console.log('--- ALL TYPES ---');
  console.log(types.map(t => `${t.id}: ${t.name} (deleted: ${t.deletedAt != null})`).join('\n'));
}).finally(() => prisma.$disconnect());
