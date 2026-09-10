const fs = require('fs');

// Fix UsersController
let fController = 'src/users/users.controller.ts';
let cController = fs.readFileSync(fController, 'utf8');
cController = cController.replace("import { Req } from '@nestjs/common';\n", "");
cController = cController.replace("@Controller('users')\nimport { Req } from '@nestjs/common';", "@Controller('users')");
cController = "import { Req } from '@nestjs/common';\n" + cController;
fs.writeFileSync(fController, cController);

// Fix PrismaService
let fPrisma = 'src/prisma/prisma.service.ts';
let cPrisma = fs.readFileSync(fPrisma, 'utf8');
cPrisma = cPrisma.replace(
  "public auditLog: PrismaClient['auditLog'];",
  "public auditLog: PrismaClient['auditLog'];\n  public notification: PrismaClient['notification'];"
);
cPrisma = cPrisma.replace(
  "this.auditLog = this.client.auditLog;",
  "this.auditLog = this.client.auditLog;\n    this.notification = this.client.notification;"
);
fs.writeFileSync(fPrisma, cPrisma);

console.log('Fixed backend errors');
