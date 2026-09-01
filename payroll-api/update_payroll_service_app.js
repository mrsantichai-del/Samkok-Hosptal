const fs = require('fs');

const file = 'src/payroll/payroll.service.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Add approvePayroll method
const approveMethod = `
  async approvePayroll(id: string, userId: string) {
    const record = await this.prisma.payrollRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Payroll record not found');
    if (record.status !== 'DRAFT') throw new BadRequestException('Only DRAFT records can be approved');

    return this.prisma.payrollRecord.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: userId
      }
    });
  }
`;

if (!content.includes('async approvePayroll')) {
  // Find where to insert
  const insertIndex = content.lastIndexOf('}'); // End of class
  content = content.slice(0, insertIndex) + approveMethod + '\n' + content.slice(insertIndex);
}

// 2. Add signature loading to generatePdf
// Replace "const signatureBuffer = await fetchImageBuffer('signature');"
// With looking up the approver's signature
const newSignatureLogic = `
    let signatureBuffer = null;
    if (record.status === 'APPROVED' && record.approvedById) {
      const approver = await this.prisma.user.findUnique({ where: { id: record.approvedById } });
      if (approver?.signatureUrl) {
        // Extract filename from URL (assumes supabase storage public URL format)
        const parts = approver.signatureUrl.split('/');
        const fileName = parts[parts.length - 1];
        
        const { data: fileData, error: downloadError } = await supabase.storage.from('uploads').download(fileName);
        if (!downloadError && fileData) {
          const arrayBuffer = await fileData.arrayBuffer();
          signatureBuffer = Buffer.from(arrayBuffer);
        }
      }
    }
`;

content = content.replace(
  "const signatureBuffer = await fetchImageBuffer('signature');",
  newSignatureLogic
);

// We need to fetch `record` earlier in `generatePdf` because it originally isn't fetched at the top maybe?
// Wait, generatePdf receives `id: string` in `generateSlipPdf`.
// Let's check `generateSlipPdf` definition.
fs.writeFileSync(file, content);
console.log("Updated payroll.service.ts part 1");
