import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessPayrollDto } from './dto/process-payroll.dto';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import type { Response } from 'express';

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://wjjewbltlwvsqljeazlz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqamV3Ymx0bHd2c3FsamVhemx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzczOTkxNCwiZXhwIjoyMTAzMzE1OTE0fQ.j2TyaPGhFOIvoO7RhO7i6CKJspjMoia4gMPJ5VVMKH4'
);

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  // ... existing methods (processPayroll, getPayrollRecords, getPayrollTransactions, approvePayroll)
  async processPayroll(dto: ProcessPayrollDto, userId: string) {
    const { month, year } = dto;
    const existing = await this.prisma.payrollRecord.findUnique({ where: { month_year: { month, year } } });
    if (existing) {
      if (existing.status === 'APPROVED' || existing.status === 'PAID') throw new BadRequestException('Payroll already approved');
      await this.prisma.payrollTransaction.deleteMany({ where: { payrollRecordId: existing.id } });
      await this.prisma.payrollRecord.delete({ where: { id: existing.id } });
    }
    const employees = await this.prisma.employee.findMany({ where: { deletedAt: null } });
    const payItems = await this.prisma.payItem.findMany({ where: { deletedAt: null } });
    const record = await this.prisma.payrollRecord.create({ data: { month, year, status: 'DRAFT' } });
    const transactions = [];
    for (const emp of employees) {
      for (const item of payItems) {
        let amount = 0;
        if (item.name === 'เงินเดือน') amount = 15000; // Mock calculation
        transactions.push({ payrollRecordId: record.id, employeeId: emp.id, payItemId: item.id, amount, formulaUsed: item.defaultFormula || 'MANUAL' });
      }
    }
    await this.prisma.payrollTransaction.createMany({ data: transactions });
    await this.prisma.auditLog.create({
       data: { action: 'PROCESS_PAYROLL', tableName: 'PayrollRecord', recordId: record.id, userId, reason: `Processed payroll for ${month}/${year}` }
    });
    return { message: 'Payroll processed successfully', recordId: record.id, count: transactions.length };
  }

  async getPayrollRecords() { return this.prisma.payrollRecord.findMany({ orderBy: [{ year: 'desc' }, { month: 'desc' }] }); }

  async getPayrollTransactions(recordId: string, employeeId?: string) {
    const whereClause: any = { payrollRecordId: recordId, deletedAt: null };
    if (employeeId) whereClause.employeeId = employeeId;
    return this.prisma.payrollTransaction.findMany({
      where: whereClause,
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true, position: { select: { id: true, name: true } }, employeeType: { select: { id: true, name: true } } } }, payItem: { select: { name: true, type: true } } }
    });
  }

  async updateEmployeeTransactions(recordId: string, employeeId: string, transactions: { payItemId: string, amount: number }[], userId: string) {
    const record = await this.prisma.payrollRecord.findUnique({ where: { id: recordId } });
    if (!record || record.status !== 'DRAFT') throw new BadRequestException('Cannot edit transactions for approved/paid payroll');

    // Delete existing transactions for this employee in this record
    await this.prisma.payrollTransaction.deleteMany({
      where: { payrollRecordId: recordId, employeeId: employeeId }
    });

    // Insert new ones
    const newTx = transactions.map(t => ({
      payrollRecordId: recordId,
      employeeId: employeeId,
      payItemId: t.payItemId,
      amount: Number(t.amount) || 0,
      formulaUsed: 'MANUAL_EDIT'
    }));

    if (newTx.length > 0) {
      await this.prisma.payrollTransaction.createMany({ data: newTx });
    }

    await this.prisma.auditLog.create({ 
      data: { action: 'EDIT_PAYROLL_TX', tableName: 'PayrollTransaction', recordId: recordId, userId, reason: `Edited transactions for employee ${employeeId}` } 
    });

    return { message: 'Transactions updated successfully' };
  }

  async approvePayroll(recordId: string, userId: string) {
    const record = await this.prisma.payrollRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Record not found');
    await this.prisma.payrollRecord.update({ where: { id: recordId }, data: { status: 'APPROVED', approvedById: userId } });
    await this.prisma.auditLog.create({ data: { action: 'APPROVE_PAYROLL', tableName: 'PayrollRecord', recordId: record.id, userId } });
    return { message: 'Payroll approved' };
  }

  async exportExcel(recordId: string, res: Response, employeeIds?: string[]) {
    const record = await this.prisma.payrollRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Record not found');

    let transactions = await this.getPayrollTransactions(recordId);
    if (employeeIds && employeeIds.length > 0) {
      transactions = transactions.filter(tx => employeeIds.includes(tx.employeeId));
      transactions.sort((a, b) => employeeIds.indexOf(a.employeeId) - employeeIds.indexOf(b.employeeId));
    }
    
    // Group by Employee
    const empData = new Map<string, any>();
    const incomeHeaders = new Set<string>();
    const deductionHeaders = new Set<string>();

    for (const tx of transactions) {
      if (!tx.employee || !tx.payItem) continue;

      if (!empData.has(tx.employeeId)) {
        empData.set(tx.employeeId, { employee: tx.employee, incomes: {}, deductions: {}, totalIncome: 0, totalDeduction: 0 });
      }
      const e = empData.get(tx.employeeId);
      const amount = Number(tx.amount) || 0;
      if (tx.payItem.type === 'INCOME') {
         e.incomes[tx.payItem.name] = amount;
         e.totalIncome += amount;
         incomeHeaders.add(tx.payItem.name);
      } else {
         e.deductions[tx.payItem.name] = amount;
         e.totalDeduction += amount;
         deductionHeaders.add(tx.payItem.name);
      }
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`Payroll_${record.month}_${record.year}`);

    // Headers
    const incArr = Array.from(incomeHeaders);
    const dedArr = Array.from(deductionHeaders);
    
    const headers = ['ลำดับที่', 'รหัสพนักงาน', 'ชื่อ-นามสกุล', 'ตำแหน่ง', 'ประเภทพนักงาน', ...incArr, 'รวมรายรับ', ...dedArr, 'รวมรายจ่าย', 'รับสุทธิ'];
    sheet.addRow(headers);
    sheet.getRow(1).font = { bold: true };

    let seq = 1;
    for (const e of empData.values()) {
       const row = [
         seq++,
         e.employee.employeeCode || '-',
         `${e.employee.firstName || ''} ${e.employee.lastName || ''}`.trim(),
         e.employee.position?.name || 'ไม่ระบุ',
         e.employee.employeeType?.name || 'ไม่ระบุ',
         ...incArr.map(h => e.incomes[h] || 0),
         e.totalIncome,
         ...dedArr.map(h => e.deductions[h] || 0),
         e.totalDeduction,
         e.totalIncome - e.totalDeduction
       ];
       sheet.addRow(row);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Payroll_${record.month}_${record.year}.xlsx"`);
    
    await workbook.xlsx.write(res);
    res.end();
  }

  async exportPdf(recordId: string, res: Response, employeeIds?: string[]) {
    const record = await this.prisma.payrollRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Record not found');

    let transactions = await this.getPayrollTransactions(recordId);
      if (employeeIds && employeeIds.length > 0) {
        transactions = transactions.filter(tx => employeeIds.includes(tx.employeeId));
        transactions.sort((a, b) => employeeIds.indexOf(a.employeeId) - employeeIds.indexOf(b.employeeId));
      }
    const allPayItems = await this.prisma.payItem.findMany({ orderBy: { createdAt: 'asc' } });
    const allIncomes = allPayItems.filter(p => p.type === 'INCOME');
    const allDeductions = allPayItems.filter(p => p.type === 'DEDUCTION');
    
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Payslips_${record.month}_${record.year}.pdf"`);
    doc.pipe(res);
    
    const { bahttext } = require('bahttext');
      const fs = require('fs');
      const path = require('path');

      // Use path.join with __dirname so it works in both dev (dist/) and prod (dist/)
      const fontRegular = path.join(__dirname, '..', 'assets', 'fonts', 'Sarabun-Regular.ttf');
      const fontBold = path.join(__dirname, '..', 'assets', 'fonts', 'Sarabun-Bold.ttf');
      
      // Fallbacks just in case we are running from src/ directly (e.g. ts-node)
      const finalFontRegular = fs.existsSync(fontRegular) ? fontRegular : path.join(process.cwd(), 'src', 'assets', 'fonts', 'Sarabun-Regular.ttf');
      const finalFontBold = fs.existsSync(fontBold) ? fontBold : path.join(process.cwd(), 'src', 'assets', 'fonts', 'Sarabun-Bold.ttf');

      doc.registerFont('ThaiRegular', finalFontRegular);
      doc.registerFont('ThaiBold', finalFontBold);
    
    const fetchImageBuffer = async (namePrefix: string) => {
      const { data, error } = await supabase.storage.from('uploads').list();
      if (error || !data) return null;
      const file = data.find((f: any) => f.name.startsWith(namePrefix + '.'));
      if (!file) return null;
      const { data: fileData, error: downloadError } = await supabase.storage.from('uploads').download(file.name);
      if (downloadError || !fileData) return null;
      const arrayBuffer = await fileData.arrayBuffer();
      return Buffer.from(arrayBuffer);
    };

    const logoBuffer = await fetchImageBuffer('logo');
    
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


    const empData = new Map<string, any>();
    for (const tx of transactions) {
      if (!tx.employee || !tx.payItem) continue;
      
      if (!empData.has(tx.employeeId)) {
        empData.set(tx.employeeId, { employee: tx.employee, txMap: new Map<string, number>(), totalInc: 0, totalDed: 0, net: 0 });
      }
      const e = empData.get(tx.employeeId);
      const amount = Number(tx.amount) || 0;
      e.txMap.set(tx.payItem.name, amount);
      if (tx.payItem.type === 'INCOME') {
         e.totalInc += amount;
         e.net += amount;
      } else {
         e.totalDed += amount;
         e.net -= amount;
      }
    }

    let i = 0;
    const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    const monthStr = `${monthNames[record.month - 1]} ${record.year + 543}`;

    for (const e of empData.values()) {
      if (i > 0) doc.addPage();
      
      const maxRows = Math.max(allIncomes.length, allDeductions.length);
      const rowHeight = 18;
      const startY = 150;
      const endY = startY + 20 + (maxRows * rowHeight) + 20;

      // Draw Outer Border
      doc.lineWidth(1).rect(40, 40, 515, endY - 40 + 50).stroke();

      if (logoBuffer) {
        try {
          doc.image(logoBuffer, 50, 45, { height: 40 });
        } catch (err) {
          console.error("Failed to load logo image:", err);
        }
      }

      doc.font('ThaiBold').fontSize(16).text(`โรงพยาบาลสามโคก ประจำเดือน ${monthStr}`, 40, 50, { align: 'center' });
      doc.font('ThaiBold').fontSize(12).text(`ใบแจ้งรายละเอียดเงินเดือน`, 40, 70, { align: 'center' });
      
      doc.moveDown();
      doc.font('ThaiBold').fontSize(12).text(`ชื่อ `, 120, 105, { continued: true });
      doc.font('ThaiRegular').text(`${e.employee.firstName} ${e.employee.lastName}    `);
      
      doc.font('ThaiBold').text(`รหัสพนักงาน: `, 300, 105, { continued: true });
      doc.font('ThaiRegular').text(`${e.employee.employeeCode}`);

      doc.font('ThaiBold').text(`ตำแหน่ง `, 120, 125, { continued: true });
      doc.font('ThaiRegular').text(`${e.employee.position?.name || '-'}    `);

      // Main Table Layout
      doc.lineWidth(0.5);
      doc.moveTo(40, startY).lineTo(555, startY).stroke();
      
      doc.font('ThaiBold').fontSize(12);
      doc.text('รายรับ', 40, startY + 5, { width: 257, align: 'center' });
      doc.text('รายจ่าย', 297, startY + 5, { width: 258, align: 'center' });
      
      doc.moveTo(40, startY + 20).lineTo(555, startY + 20).stroke();
      doc.moveTo(297, startY).lineTo(297, endY).stroke();

      doc.font('ThaiRegular');
      let currentY = startY + 25;
      
      for (let r = 0; r < maxRows; r++) {
         const incItem = allIncomes[r];
         const dedItem = allDeductions[r];

         if (incItem) {
            const amount = e.txMap.get(incItem.name) || 0;
            doc.text(incItem.name, 45, currentY);
            doc.text(amount > 0 ? amount.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-', 200, currentY, { width: 90, align: 'right' });
         }

         if (dedItem) {
            const amount = e.txMap.get(dedItem.name) || 0;
            doc.text(dedItem.name, 305, currentY);
            doc.text(amount > 0 ? amount.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-', 455, currentY, { width: 90, align: 'right' });
         }

         doc.save().strokeColor('#e5e7eb').moveTo(40, currentY + 14).lineTo(555, currentY + 14).stroke().restore();
         currentY += rowHeight;
      }

      doc.moveTo(40, endY - 20).lineTo(555, endY - 20).stroke();
      
      doc.font('ThaiBold');
      doc.text('รวมรับ', 40, endY - 15, { width: 160, align: 'center' });
      doc.text(e.totalInc > 0 ? e.totalInc.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-', 200, endY - 15, { width: 90, align: 'right' });
      
      doc.text('รวมจ่าย', 297, endY - 15, { width: 158, align: 'center' });
      doc.text(e.totalDed > 0 ? e.totalDed.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-', 455, endY - 15, { width: 90, align: 'right' });

      doc.moveTo(40, endY).lineTo(555, endY).stroke();
      
      // Net Pay
      doc.fontSize(14).text(`คงเหลือสุทธิ`, 180, endY + 10, { continued: true });
      doc.text(`${e.net.toLocaleString(undefined, {minimumFractionDigits: 2})} บาท`, { align: 'right' });
      
      doc.fontSize(12).font('ThaiRegular').text(`(${bahttext(e.net)})`, 40, endY + 30, { align: 'center' });

      if (signatureBuffer) {
        try {
          doc.image(signatureBuffer, 300, endY + 50, { height: 40 });
        } catch (err) {
          console.error("Failed to load signature image:", err);
        }
      }

      i++;
    }

    doc.end();
  }
}
