const fs = require('fs');

// Fix prisma.service.ts
let pFile = 'src/prisma/prisma.service.ts';
let pContent = fs.readFileSync(pFile, 'utf8');
pContent = pContent.replace("public role: PrismaClient['role'];", "public role: PrismaClient['role'];\n  public userRole: PrismaClient['userRole'];");
pContent = pContent.replace("this.role = this.client.role;", "this.role = this.client.role;\n    this.userRole = this.client.userRole;");
fs.writeFileSync(pFile, pContent);

// Fix implicitly any in payroll.service.ts
let sFile = 'src/payroll/payroll.service.ts';
let sContent = fs.readFileSync(sFile, 'utf8');
sContent = sContent.replace("const userIds = roles.map(r => r.userId);", "const userIds = roles.map((r: any) => r.userId);");
sContent = sContent.replace("data: userIds.map(id => ({", "data: userIds.map((id: string) => ({");
fs.writeFileSync(sFile, sContent);

console.log('Fixed PrismaService and any types');
