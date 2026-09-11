"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, Building2, User, FileText, CheckCircle2 } from "lucide-react";

interface Form50TawiProps {
  data: {
    taxYear: number;
    ceYear: number;
    payer: {
      name: string;
      taxId: string;
      address: string;
      phone?: string;
      directorTitle?: string;
    };
    payee: {
      id: string;
      employeeCode: string;
      fullName: string;
      idCard: string;
      department: string;
      position: string;
      employeeType: string;
      bankAccount?: string;
      bankName?: string;
    };
    incomeSections: {
      sec40_1: { name: string; payDate: string; amount: number; taxWithheld: number };
      sec40_2: { name: string; payDate: string; amount: number; taxWithheld: number };
      sec40_6: { name: string; payDate: string; amount: number; taxWithheld: number };
    };
    funds: {
      socialSecurity: number;
      gpfOrProvidentFund: number;
      totalFunds: number;
    };
    summary: {
      totalIncome: number;
      totalTaxWithheld: number;
      thaiBahtTotalIncome: string;
      thaiBahtTotalTax: string;
      withholdingCondition: string;
    };
    monthlyBreakdown?: any[];
    issuedDate: string;
  };
  onPrint?: () => void;
}

// Helper to render 13 digit boxes
const DigitsBox = ({ value }: { value: string }) => {
  const clean = (value || "").replace(/\D/g, "");
  const chars = Array.from({ length: 13 }, (_, i) => clean[i] || "");

  return (
    <div className="inline-flex items-center gap-0.5 text-xs font-mono font-bold">
      <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">{chars[0]}</div>
      <span className="text-gray-400 font-normal">-</span>
      <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">{chars[1]}</div>
      <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">{chars[2]}</div>
      <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">{chars[3]}</div>
      <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">{chars[4]}</div>
      <span className="text-gray-400 font-normal">-</span>
      <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">{chars[5]}</div>
      <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">{chars[6]}</div>
      <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">{chars[7]}</div>
      <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">{chars[8]}</div>
      <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">{chars[9]}</div>
      <span className="text-gray-400 font-normal">-</span>
      <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">{chars[10]}</div>
      <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">{chars[11]}</div>
      <span className="text-gray-400 font-normal">-</span>
      <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">{chars[12]}</div>
    </div>
  );
};

export default function Form50Tawi({ data, onPrint }: Form50TawiProps) {
  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Action Header for Screen View */}
      <div className="flex items-center justify-between print:hidden bg-blue-50/70 p-3 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-700" />
          <div>
            <h4 className="text-sm font-bold text-blue-900">
              หนังสือรับรองการหักภาษี ณ ที่จ่าย (ใบ 50 ทวิ) ประจำปีภาษี พ.ศ. {data.taxYear}
            </h4>
            <p className="text-xs text-blue-700">
              สำหรับ {data.payee.fullName} ({data.payee.position}) • สังกัด: {data.payee.department}
            </p>
          </div>
        </div>
        <Button 
          onClick={onPrint || (() => window.print())} 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4 mr-1.5" />
          พิมพ์ใบ 50 ทวิ (Print A4)
        </Button>
      </div>

      {/* Official 50 Tawi Document Body */}
      <div className="bg-white text-black p-6 md:p-8 rounded-lg shadow-sm border border-gray-300 font-serif text-[11px] leading-relaxed max-w-[850px] mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:text-[10.5px]">
        {/* Document Header */}
        <div className="text-center relative mb-4">
          <div className="absolute right-0 top-0 text-[10px] text-gray-700 font-bold border border-black px-2 py-0.5">
            แบบ 50 ทวิ
          </div>
          <h2 className="text-base font-bold font-serif">หนังสือรับรองการหักภาษี ณ ที่จ่าย</h2>
          <p className="text-xs font-serif text-gray-800">
            ตามมาตรา 50 ทวิ แห่งประมวลรัษฎากร
          </p>
          <div className="text-right text-[10px] mt-1">
            <span>เล่มที่/เลขที่: <b>50TW-{data.taxYear}-{data.payee.employeeCode}</b></span>
          </div>
        </div>

        {/* Section 1: Payer (ผู้มีหน้าที่หักภาษี ณ ที่จ่าย) */}
        <div className="border border-black p-2.5 mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
            <span className="font-bold">1. ผู้มีหน้าที่หักภาษี ณ ที่จ่าย:</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px]">เลขประจำตัวผู้เสียภาษีอากร:</span>
              <DigitsBox value={data.payer.taxId} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            <div className="md:col-span-2">
              <span>ชื่อ: <b>{data.payer.name}</b></span>
            </div>
          </div>
          <div className="mt-0.5 text-gray-800">
            <span>ที่อยู่: {data.payer.address}</span>
          </div>
        </div>

        {/* Section 2: Payee (ผู้ถูกหักภาษี ณ ที่จ่าย) */}
        <div className="border border-black p-2.5 mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
            <span className="font-bold">2. ผู้ถูกหักภาษี ณ ที่จ่าย:</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px]">เลขประจำตัวประชาชน:</span>
              <DigitsBox value={data.payee.idCard} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            <div>
              <span>ชื่อ-สกุล: <b>{data.payee.fullName}</b> (รหัส: {data.payee.employeeCode})</span>
            </div>
            <div>
              <span>ตำแหน่ง: <b>{data.payee.position}</b> ({data.payee.employeeType})</span>
            </div>
          </div>
          <div className="mt-0.5 text-gray-800">
            <span>สังกัด/ที่อยู่: {data.payee.department}, {data.payer.name}</span>
          </div>
        </div>

        {/* Section 3: Income Table (ประเภทเงินได้พึงประเมินที่จ่าย) */}
        <table className="w-full border-collapse border border-black text-center my-2">
          <thead>
            <tr className="bg-gray-100 font-bold border-b border-black">
              <th className="border-r border-black p-1.5 text-left w-[46%]">ประเภทเงินได้พึงประเมินที่จ่าย</th>
              <th className="border-r border-black p-1.5 w-[22%]">วัน เดือน หรือปีภาษี ที่จ่าย</th>
              <th className="border-r border-black p-1.5 w-[16%] text-right">จำนวนเงินที่จ่าย (บาท)</th>
              <th className="p-1.5 w-[16%] text-right">ภาษีที่หักและนำส่ง (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {/* 40(1) */}
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 text-left font-medium">
                1. เงินเดือน ค่าจ้าง เบี้ยเลี้ยง โบนัส ฯลฯ ตาม ม.40 (1)
              </td>
              <td className="border-r border-black p-1 text-gray-700 text-[10px]">
                {data.incomeSections.sec40_1.payDate}
              </td>
              <td className="border-r border-black p-1 text-right font-mono">
                {data.incomeSections.sec40_1.amount > 0 ? data.incomeSections.sec40_1.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-'}
              </td>
              <td className="p-1 text-right font-mono">
                {data.incomeSections.sec40_1.taxWithheld > 0 ? data.incomeSections.sec40_1.taxWithheld.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '0.00'}
              </td>
            </tr>

            {/* 40(2) */}
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 text-left text-gray-700">
                2. ค่าธรรมเนียม ค่านายหน้า ฯลฯ ตาม ม.40 (2)
              </td>
              <td className="border-r border-black p-1 text-gray-700 text-[10px]">
                {data.incomeSections.sec40_2.payDate}
              </td>
              <td className="border-r border-black p-1 text-right font-mono text-gray-600">
                {data.incomeSections.sec40_2.amount > 0 ? data.incomeSections.sec40_2.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-'}
              </td>
              <td className="p-1 text-right font-mono text-gray-600">
                {data.incomeSections.sec40_2.taxWithheld > 0 ? data.incomeSections.sec40_2.taxWithheld.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-'}
              </td>
            </tr>

            {/* 40(6) */}
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 text-left text-gray-700">
                3. ค่าวิชาชีพอิสระ ตาม ม.40 (6)
              </td>
              <td className="border-r border-black p-1 text-gray-700 text-[10px]">
                {data.incomeSections.sec40_6.payDate}
              </td>
              <td className="border-r border-black p-1 text-right font-mono text-gray-600">
                {data.incomeSections.sec40_6.amount > 0 ? data.incomeSections.sec40_6.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-'}
              </td>
              <td className="p-1 text-right font-mono text-gray-600">
                {data.incomeSections.sec40_6.taxWithheld > 0 ? data.incomeSections.sec40_6.taxWithheld.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-'}
              </td>
            </tr>

            {/* Total Row */}
            <tr className="bg-gray-50 font-bold border-t-2 border-black">
              <td className="border-r border-black p-1.5 text-center" colSpan={2}>
                รวมเงินที่จ่ายและภาษีที่หักนำส่ง
              </td>
              <td className="border-r border-black p-1.5 text-right font-mono font-bold">
                ฿{data.summary.totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </td>
              <td className="p-1.5 text-right font-mono font-bold text-blue-900">
                ฿{data.summary.totalTaxWithheld.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </td>
            </tr>

            {/* Thai Baht Text Row */}
            <tr className="border-t border-black bg-white">
              <td colSpan={4} className="p-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span>รวมเงินภาษีที่หักนำส่ง (ตัวอักษร): <b className="text-black font-serif underline">{data.summary.thaiBahtTotalTax}</b></span>
                  <span className="text-[10px] text-gray-600">รวมเงินได้ทั้งปี: {data.summary.thaiBahtTotalIncome}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Section 4: Funds (เงินสะสมเข้ากองทุน) */}
        <div className="border border-black p-2 mb-2">
          <span className="font-bold">เงินสะสมเข้ากองทุน (ถ้ามี):</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
            <div className="flex items-center justify-between border-r pr-2 border-gray-300">
              <span>(1) กองทุนประกันสังคม:</span>
              <span className="font-mono font-bold">
                ฿{data.funds.socialSecurity.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between pl-2">
              <span>(2) กองทุนสำรองเลี้ยงชีพ / กบข. / กสจ.:</span>
              <span className="font-mono font-bold">
                ฿{data.funds.gpfOrProvidentFund.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: Withholding Conditions & Signature */}
        <div className="border border-black p-2.5">
          <div className="flex items-center gap-4 text-[10px] mb-2">
            <span className="font-bold">ผู้จ่ายเงิน:</span>
            <label className="inline-flex items-center gap-1 font-bold">
              <span className="w-3 h-3 border border-black inline-flex items-center justify-center text-[9px] font-bold">✓</span>
              (1) หัก ณ ที่จ่าย
            </label>
            <label className="inline-flex items-center gap-1 text-gray-600">
              <span className="w-3 h-3 border border-black inline-block"></span>
              (2) ออกให้ตลอดไป
            </label>
            <label className="inline-flex items-center gap-1 text-gray-600">
              <span className="w-3 h-3 border border-black inline-block"></span>
              (3) ออกให้ครั้งเดียว
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-300">
            <div className="text-[10px] text-gray-600 space-y-1">
              <p><b>คำเตือน:</b> ผู้มีหน้าที่ออกหนังสือรับรองการหักภาษี ณ ที่จ่าย ฝ่าฝืนไม่ปฏิบัติตามมาตรา 50 ทวิ แห่งประมวลรัษฎากร ต้องระวางโทษตามที่กฎหมายกำหนด</p>
              <p>ออกให้ ณ วันที่: <b>{data.issuedDate}</b></p>
            </div>

            <div className="text-center space-y-1.5">
              <div className="h-9 flex items-center justify-center">
                <span className="font-serif italic text-gray-400 text-xs">----------------------------------------------------</span>
              </div>
              <p className="font-bold font-serif">({data.payer.directorTitle})</p>
              <p className="text-[10px] text-gray-600">ผู้มีอำนาจลงนาม / ประทับตรานิติบุคคล</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
