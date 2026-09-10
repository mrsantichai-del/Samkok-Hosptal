const fs = require('fs');
let file = 'prisma/schema.prisma';
let content = fs.readFileSync(file, 'utf8');

// Add edit request fields to PayrollRecord
content = content.replace(
  '  approvedBy   User?      @relation(fields: [approvedById], references: [id])',
  '  approvedBy   User?      @relation(fields: [approvedById], references: [id])\n\n  editRequestReason String?\n  editRequestedAt   DateTime?'
);

// Add Notification model at the end
content += `
// ------------------------------------------------------
// Notifications
// ------------------------------------------------------
model Notification {
  id        String   @id @default(uuid())
  userId    String?  // Target specific user
  user      User?    @relation(fields: [userId], references: [id])
  roleName  String?  // Target all users with this role (e.g., "Executive")
  title     String
  message   String
  isRead    Boolean  @default(false)
  linkUrl   String?
  createdAt DateTime @default(now())
}
`;

fs.writeFileSync(file, content);
console.log('Updated schema.prisma');
