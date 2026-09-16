"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Printer, Building2, User, DollarSign, ArrowDown, ArrowUp, CheckCircle2 } from "lucide-react";

interface PayslipProps {
  employee: {
    id: string;
    employeeCode: string;
    fullName: string;
    idCard?: string;
    department: string;
    position: string;
    employeeType: string;
    bankAccount?: string;
    bankName?: string;
    baseSalary?: number;
  };
  payslip: {
    recordId: string;
    year: number;
    thaiYear: number;
    month: number;
    monthName: string;
    round: number;
    roundName?: string;
    payPeriodStart?: string;
    payPeriodEnd?: string;
    grossIncome: number;
    totalDeductions: number;
    netPayout: number;
    thaiBahtNetPayout: string;
    incomes: { id: string; name: string; amount: number }[];
    deductions: { id: string; name: string; amount: number }[];
    ytd: {
      grossIncome: number;
      totalDeductions: number;
      netPayout: number;
      tax: number;
      socialSecurity: number;
      gpf: number;
    };
  };
  onPrint?: () => void;
}

export default function PayslipTemplate({ employee, payslip, onPrint }: PayslipProps) {
  if (!employee || !payslip) return null;

  return (
    <div className="space-y-4">
      {/* Top Action Bar for Screen View */}
      <div className="flex items-center justify-between print:hidden bg-emerald-50/80 p-3 rounded-lg border border-emerald-200">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-700" />
          <div>
            <h4 className="text-sm font-bold text-emerald-900">
              ใบจ่ายเงินเดือน (Payslip) ประจำเดือน {payslip.monthName} พ.ศ. {payslip.thaiYear}
            </h4>
            <p className="text-xs text-emerald-700">
              {employee.fullName} ({employee.position}) • สังกัด: {employee.department}
            </p>
          </div>
        </div>
        <Button 
          onClick={onPrint || (() => window.print())} 
          size="sm" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4 mr-1.5" />
          พิมพ์สลิปเงินเดือน (Print Payslip)
        </Button>
      </div>

      {/* Official Payslip Printable Container (Styled exactly like official format in Image 2) */}
      <div className="bg-white text-black p-6 md:p-8 rounded-lg shadow-sm border border-gray-400 font-sans text-xs max-w-[850px] mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
        
        {/* Outer Official Border Box */}
        <div className="border border-gray-800 p-5 md:p-7 rounded-sm">
          
          {/* Header with Hospital Logo & Title */}
          <div className="flex items-start justify-between mb-4 relative pb-2 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="Logo" className="w-14 h-14 object-contain rounded-full border border-gray-300 shadow-2xs" />
              <div>
                <h2 className="text-lg md:text-xl font-bold text-black tracking-tight">
                  โรงพยาบาลสามโคก ประจำเดือน {payslip.monthName} {payslip.thaiYear}
                </h2>
                <h3 className="text-sm font-bold text-gray-800 mt-0.5">
                  ใบแจ้งรายละเอียดเงินเดือน
                </h3>
              </div>
            </div>
            {payslip.roundName && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded self-center">
                {payslip.roundName}
              </span>
            )}
          </div>

          {/* Employee Header Info (matching Image 2 layout) */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs mb-4 text-gray-900">
            <div className="flex items-center">
              <span className="font-bold min-w-[70px]">ชื่อ</span>
              <span className="font-semibold">{employee.fullName}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold min-w-[90px]">รหัสพนักงาน:</span>
              <span className="font-mono font-bold text-gray-900">{employee.employeeCode}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold min-w-[70px]">ตำแหน่ง</span>
              <span>{employee.position || 'ไม่ระบุ'}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold min-w-[90px]">กลุ่มงาน:</span>
              <span>{employee.department || 'ไม่ระบุ'}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold min-w-[70px]">ประเภท:</span>
              <span>{employee.employeeType || 'ไม่ระบุ'}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold min-w-[90px]">เลขบัตร ปชช.:</span>
              <span className="font-mono">{employee.idCard || '-'}</span>
            </div>
          </div>

          {/* Main 2-Column Table (รายรับ | รายจ่าย) matching Image 2 */}
          <div className="border border-gray-800 rounded-xs overflow-hidden mb-3">
            {/* Table Header */}
            <div className="grid grid-cols-2 bg-gray-100/80 border-b border-gray-800 font-bold text-center text-xs">
              <div className="py-1.5 border-r border-gray-800 text-gray-900">รายรับ</div>
              <div className="py-1.5 text-gray-900">รายจ่าย</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200 text-xs">
              {Array.from({ length: Math.max(payslip.incomes.length, payslip.deductions.length, 6) }).map((_, idx) => {
                const inc = payslip.incomes[idx];
                const ded = payslip.deductions[idx];

                return (
                  <div key={idx} className="grid grid-cols-2 min-h-[26px]">
                    {/* Income cell */}
                    <div className="flex items-center justify-between px-3 py-1 border-r border-gray-800">
                      <span className="text-gray-800 truncate">{inc ? inc.name : ''}</span>
                      <span className="font-mono font-medium text-gray-900 shrink-0 ml-2">
                        {inc && inc.amount > 0 ? inc.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : (inc ? '0.00' : '-')}
                      </span>
                    </div>

                    {/* Deduction cell */}
                    <div className="flex items-center justify-between px-3 py-1">
                      <span className="text-gray-800 truncate">{ded ? ded.name : ''}</span>
                      <span className="font-mono font-medium text-rose-700 shrink-0 ml-2">
                        {ded && ded.amount > 0 ? ded.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : (ded ? '0.00' : '-')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Row (รวมรับ | รวมจ่าย) */}
            <div className="grid grid-cols-2 bg-gray-100/70 border-t border-gray-800 font-bold text-xs">
              <div className="flex items-center justify-between px-3 py-2 border-r border-gray-800">
                <span className="text-gray-900 font-bold">รวมรับ</span>
                <span className="font-mono text-emerald-800 font-bold">
                  {payslip.grossIncome > 0 ? payslip.grossIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-gray-900 font-bold">รวมจ่าย</span>
                <span className="font-mono text-rose-800 font-bold">
                  {payslip.totalDeductions > 0 ? payslip.totalDeductions.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '0.00'}
                </span>
              </div>
            </div>

            {/* Net Payout Summary (คงเหลือสุทธิ) */}
            <div className="border-t border-gray-800 bg-emerald-50/40 p-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-gray-900">คงเหลือสุทธิ</span>
                <span className="font-mono text-base font-extrabold text-emerald-900">
                  {payslip.netPayout.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                </span>
              </div>
              <div className="text-center text-xs font-semibold text-gray-700 mt-1">
                ({payslip.thaiBahtNetPayout})
              </div>
            </div>
          </div>

          {/* YTD Cumulative Summary Box (if data exists) */}
          {payslip.ytd && (payslip.ytd.grossIncome > 0 || payslip.ytd.tax > 0 || payslip.ytd.socialSecurity > 0 || payslip.ytd.gpf > 0) && (
            <div className="border border-gray-300 rounded p-2.5 bg-gray-50/60 mt-3 text-[11px]">
              <div className="font-bold text-gray-800 mb-1.5">
                สรุปยอดสะสมตั้งแต่ต้นปี (Cumulative Summary / YTD พ.ศ. {payslip.thaiYear}):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-1.5 rounded border border-gray-200">
                  <span className="text-gray-500 text-[10px] block">รายได้สะสม:</span>
                  <span className="font-bold text-gray-900 font-mono text-[11px]">
                    ฿{payslip.ytd.grossIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-white p-1.5 rounded border border-gray-200">
                  <span className="text-gray-500 text-[10px] block">ภาษีสะสม:</span>
                  <span className="font-bold text-rose-700 font-mono text-[11px]">
                    ฿{payslip.ytd.tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-white p-1.5 rounded border border-gray-200">
                  <span className="text-gray-500 text-[10px] block">ประกันสังคมสะสม:</span>
                  <span className="font-bold text-amber-800 font-mono text-[11px]">
                    ฿{payslip.ytd.socialSecurity.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-white p-1.5 rounded border border-gray-200">
                  <span className="text-gray-500 text-[10px] block">กบข./กสจ. สะสม:</span>
                  <span className="font-bold text-purple-800 font-mono text-[11px]">
                    ฿{payslip.ytd.gpf.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-3 text-center text-[10px] text-gray-400">
            เอกสารฉบับนี้พิมพ์จากระบบสารสนเทศการเงินและเงินเดือน โรงพยาบาลสามโคก
          </div>

        </div>
      </div>
    </div>
  );
}
