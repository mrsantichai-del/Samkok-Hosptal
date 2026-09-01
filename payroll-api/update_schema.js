const fs = require('fs');

const file = 'prisma/schema.prisma';
let content = fs.readFileSync(file, 'utf8');

// Add fields to User
content = content.replace(
  '  employeeId   String?   @unique',
  '  signatureUrl String?\n  imgUrl       String?\n\n  employeeId   String?   @unique'
);

// Add fields to PayrollRecord
content = content.replace(
  '  @@unique([month, year])\n}',
  '  approvedById String?\n  approvedBy   User?      @relation(fields: [approvedById], references: [id])\n\n  @@unique([month, year])\n}'
);

// Add relations to User
content = content.replace(
  '  auditLogs    AuditLog[]',
  '  auditLogs    AuditLog[]\n  approvedPayrolls PayrollRecord[]'
);

fs.writeFileSync(file, content);
console.log("Updated schema.prisma");
