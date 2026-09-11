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

      {/* Official Payslip Printable Container */}
      <div className="bg-white text-black p-6 md:p-8 rounded-lg shadow-sm border border-gray-300 font-sans text-xs max-w-[850px] mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
        {/* Header with Hospital Branding */}
        <div className="flex items-center justify-between border-b pb-3 mb-3">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Hospital Logo" className="w-12 h-12 rounded-full object-cover border border-gray-300" />
            <div>
              <h2 className="text-base font-bold text-gray-900">โรงพยาบาลสามโคก (Samkok Hospital)</h2>
              <p className="text-xs text-gray-600">ใบแจ้งรายการเงินเดือนและค่าตอบแทน (Pay Slip)</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
              ประจำงวด: {payslip.monthName} {payslip.thaiYear} {payslip.roundName ? `(${payslip.roundName})` : ''}
            </span>
            <p className="text-[10px] text-gray-400 mt-1">
              วันที่พิมพ์: {new Date().toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>

        {/* Employee Info Grid */}
        <div className="bg-gray-50/70 p-3 rounded border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-4">
          <div>
            <span className="text-gray-500 text-[11px] block">รหัสพนักงาน:</span>
            <span className="font-bold text-gray-900 font-mono">{employee.employeeCode}</span>
          </div>
          <div>
            <span className="text-gray-500 text-[11px] block">ชื่อ - นามสกุล:</span>
            <span className="font-bold text-gray-900">{employee.fullName}</span>
          </div>
          <div>
            <span className="text-gray-500 text-[11px] block">ตำแหน่ง:</span>
            <span className="font-medium text-gray-800">{employee.position}</span>
          </div>
          <div>
            <span className="text-gray-500 text-[11px] block">กลุ่มงาน / สังกัด:</span>
            <span className="font-medium text-gray-800">{employee.department}</span>
          </div>
          <div>
            <span className="text-gray-500 text-[11px] block">ประเภทการจ้าง:</span>
            <span className="font-medium text-gray-800">{employee.employeeType}</span>
          </div>
          <div>
            <span className="text-gray-500 text-[11px] block">เลขประจำตัวประชาชน:</span>
            <span className="font-medium text-gray-800 font-mono">{employee.idCard || '-'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500 text-[11px] block">บัญชีรับเงิน:</span>
            <span className="font-medium text-gray-800 font-mono">
              {employee.bankName || 'ธนาคารกรุงไทย'} {employee.bankAccount ? `(${employee.bankAccount})` : ''}
            </span>
          </div>
        </div>

        {/* Two-Column Earnings & Deductions Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Earnings Column */}
          <div className="border border-emerald-200 rounded overflow-hidden">
            <div className="bg-emerald-50 px-3 py-1.5 font-bold text-emerald-900 border-b border-emerald-200 flex items-center justify-between">
              <span>รายการได้ (Earnings)</span>
              <span className="text-[11px]">จำนวนเงิน</span>
            </div>
            <div className="divide-y divide-gray-100 min-h-[160px]">
              {payslip.incomes.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-xs">ไม่มีรายการเงินได้</div>
              ) : (
                payslip.incomes.map((item, idx) => (
                  <div key={idx} className="flex justify-between px-3 py-1.5 hover:bg-gray-50">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-mono font-semibold text-gray-900">
                      ฿{item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="bg-emerald-50/60 px-3 py-2 border-t border-emerald-200 flex justify-between font-bold text-emerald-950">
              <span>รวมเงินได้ (Gross Income)</span>
              <span className="font-mono text-sm">
                ฿{payslip.grossIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Deductions Column */}
          <div className="border border-rose-200 rounded overflow-hidden">
            <div className="bg-rose-50 px-3 py-1.5 font-bold text-rose-900 border-b border-rose-200 flex items-center justify-between">
              <span>รายการหัก (Deductions)</span>
              <span className="text-[11px]">จำนวนเงิน</span>
            </div>
            <div className="divide-y divide-gray-100 min-h-[160px]">
              {payslip.deductions.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-xs">ไม่มีรายการหัก</div>
              ) : (
                payslip.deductions.map((item, idx) => (
                  <div key={idx} className="flex justify-between px-3 py-1.5 hover:bg-gray-50">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-mono font-semibold text-rose-600">
                      -฿{item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="bg-rose-50/60 px-3 py-2 border-t border-rose-200 flex justify-between font-bold text-rose-950">
              <span>รวมเงินหัก (Total Deductions)</span>
              <span className="font-mono text-sm text-rose-600">
                -฿{payslip.totalDeductions.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Net Payout Banner */}
        <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-3.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">ยอดจ่ายสุทธิ (Net Payout)</span>
            <div className="text-xs text-blue-700 font-medium">({payslip.thaiBahtNetPayout})</div>
          </div>
          <div className="text-2xl font-black text-blue-900 font-mono">
            ฿{payslip.netPayout.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* YTD Cumulative Summary Box */}
        <div className="border border-gray-200 rounded p-3 bg-gray-50/50">
          <div className="text-[11px] font-bold text-gray-700 mb-2">
            ข้อมูลสะสมตั้งแต่ต้นปีภาษี พ.ศ. {payslip.thaiYear} ถึงงวดปัจจุบัน (Year-To-Date Accumulation):
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white p-2 rounded border border-gray-200">
              <span className="text-gray-500 text-[10px] block">รายได้สะสมทั้งปี (YTD Gross):</span>
              <span className="font-bold text-gray-900 font-mono">
                ฿{payslip.ytd.grossIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white p-2 rounded border border-gray-200">
              <span className="text-gray-500 text-[10px] block">ภาษีสะสมทั้งปี (YTD Tax):</span>
              <span className="font-bold text-rose-600 font-mono">
                ฿{payslip.ytd.tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white p-2 rounded border border-gray-200">
              <span className="text-gray-500 text-[10px] block">ประกันสังคมสะสม (YTD SSO):</span>
              <span className="font-bold text-amber-700 font-mono">
                ฿{payslip.ytd.socialSecurity.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white p-2 rounded border border-gray-200">
              <span className="text-gray-500 text-[10px] block">กบข./กสจ. สะสม (YTD GPF):</span>
              <span className="font-bold text-purple-700 font-mono">
                ฿{payslip.ytd.gpf.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-gray-200 text-center text-[10px] text-gray-400">
          เอกสารฉบับนี้พิมพ์จากระบบสารสนเทศการเงินและเงินเดือน โรงพยาบาลสามโคก • ข้อมูลถูกต้องตามบัญชีเงินเดือนที่ได้รับอนุมัติ
        </div>
      </div>
    </div>
  );
}
