"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = __importStar(require("bcrypt"));
const pool = new pg_1.Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
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
//# sourceMappingURL=seed-users.js.map