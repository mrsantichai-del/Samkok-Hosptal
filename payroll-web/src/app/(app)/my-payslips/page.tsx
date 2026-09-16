"use client";
import { API_URL } from "@/lib/config";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Printer, 
  Calendar, 
  Building2, 
  Briefcase, 
  Tag, 
  DollarSign, 
  User, 
  ChevronRight, 
  Search, 
  RefreshCw,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Percent,
  Layers,
  ShieldAlert,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import PayslipTemplate from "@/components/PayslipTemplate";
import Form50Tawi from "@/components/Form50Tawi";
import PayrollTreeSelector from "@/components/PayrollTreeSelector";

export default function MyPayslipsPage() {
  const router = useRouter();

  // Mode: 'payslip' | '50tawi'
  const [activeTab, setActiveTab] = useState<'payslip' | '50tawi'>('payslip');

  // Employee data & selector for HR/Admin
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('me');
  const [employeeInfo, setEmployeeInfo] = useState<any>(null);

  // Payslip states
  const [availableRecords, setAvailableRecords] = useState<any[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string>("");
  const [currentPayslip, setCurrentPayslip] = useState<any>(null);

  // 50 Tawi states
  const [selectedTaxYear, setSelectedTaxYear] = useState<string>(new Date().getFullYear().toString());
  const [tawiData, setTawiData] = useState<any>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [tawiLoading, setTawiLoading] = useState(false);

  // Fetch employees list for switcher (if HR/Admin)
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = Cookies.get("token");
        const res = await axios.get(`${API_URL}/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployeesList(res.data || []);
      } catch (e) {
        // Ignored if standard employee without permission
      }
    };
    fetchEmployees();
  }, []);

  // Fetch Payslip Data
  const fetchPayslipData = async (empId = selectedEmployeeId, recordId = selectedRecordId) => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const params: any = {};
      if (empId && empId !== 'me') params.employeeId = empId;

      if (recordId && availableRecords.length > 0) {
        const rec = availableRecords.find(r => r.id === recordId);
        if (rec) {
          params.year = rec.year;
          params.month = rec.month;
          params.round = rec.round;
        }
      }

      const res = await axios.get(`${API_URL}/tax-reports/my-payslips`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.hasEmployee === false) {
        setEmployeeInfo(null);
        setAvailableRecords([]);
        setCurrentPayslip(null);
      } else {
        setEmployeeInfo(res.data.employee);
        setAvailableRecords(res.data.availableRecords || []);
        setCurrentPayslip(res.data.currentPayslip);

        if (!recordId && res.data.availableRecords?.length > 0) {
          setSelectedRecordId(res.data.availableRecords[0].id);
        }
      }
    } catch (e: any) {
      console.error(e);
      setEmployeeInfo(null);
      setCurrentPayslip(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch 50 Tawi Data
  const fetch50TawiData = async (empId = selectedEmployeeId, year = selectedTaxYear) => {
    setTawiLoading(true);
    try {
      const token = Cookies.get("token");
      const params: any = { year: Number(year) };
      if (empId && empId !== 'me') params.employeeId = empId;

      const res = await axios.get(`${API_URL}/tax-reports/my-50-tawi`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.hasEmployee === false || !res.data) {
        setTawiData(null);
      } else {
        setTawiData(res.data);
      }
    } catch (e: any) {
      console.error(e);
      setTawiData(null);
    } finally {
      setTawiLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslipData(selectedEmployeeId, selectedRecordId);
  }, [selectedEmployeeId, selectedRecordId]);

  useEffect(() => {
    if (activeTab === '50tawi') {
      fetch50TawiData(selectedEmployeeId, selectedTaxYear);
    }
  }, [activeTab, selectedEmployeeId, selectedTaxYear]);

  const handlePrintPayslip = async () => {
    const recId = selectedRecordId || currentPayslip?.recordId;
    const empId = employeeInfo?.id;

    const toastId = toast.loading("กำลังสร้างสลิปเงินเดือน (PDF)...");
    try {
      const token = Cookies.get("token");
      if (token) {
        await axios.post(`${API_URL}/audit-logs/log-event`, {
          action: 'PRINT_PAYSLIP',
          tableName: 'Payslip',
          recordId: recId || empId || '',
          description: `สั่งพิมพ์สลิปเงินเดือนของ ${employeeInfo?.fullName || 'พนักงาน'} (${currentPayslip?.monthName || ''} ${currentPayslip?.thaiYear || ''})`
        }, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }

      if (recId && empId) {
        const res = await axios.post(
          `${API_URL}/payroll/records/${recId}/export/pdf`,
          { employeeIds: [empId] },
          { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
        );
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        window.open(url);
        toast.success("สร้างสลิปเงินเดือน (PDF) สำเร็จ", { id: toastId });
      } else {
        toast.dismiss(toastId);
        window.print();
      }
    } catch (e: any) {
      toast.dismiss(toastId);
      window.print();
    }
  };

  const handlePrint50Tawi = async () => {
    try {
      const token = Cookies.get("token");
      if (token) {
        await axios.post(`${API_URL}/audit-logs/log-event`, {
          action: 'PRINT_50TAWI',
          tableName: 'Form50Tawi',
          recordId: employeeInfo?.id || '',
          description: `สั่งพิมพ์หนังสือรับรองการหักภาษี ณ ที่จ่าย 50 ทวิ ของ ${employeeInfo?.fullName || 'พนักงาน'} ประจำปี ${selectedTaxYear}`
        }, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }
    } catch (e) {}
    window.print();
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-16 print:p-0 print:m-0 print:max-w-none">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-7 h-7 text-emerald-600" /> สลิปของฉัน & ภาษี 50 ทวิ
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
              Employee Portal
            </Badge>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            ศูนย์บริการข้อมูลเงินเดือนส่วนบุคคล เรียกดูสลิปย้อนหลัง และพิมพ์หนังสือรับรองภาษี 50 ทวิ
          </p>
        </div>

        {/* HR/Admin Employee Switcher */}
        {employeesList.length > 0 && (
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border shadow-xs">
            <User className="w-4 h-4 text-gray-400 ml-1.5" />
            <span className="text-xs font-bold text-gray-600">สลับดูพนักงาน:</span>
            <select
              className="text-xs border rounded px-2 py-1 bg-gray-50 font-medium cursor-pointer"
              value={selectedEmployeeId}
              onChange={e => {
                setSelectedEmployeeId(e.target.value);
                setSelectedRecordId("");
              }}
            >
              <option value="me">-- ข้อมูลของฉัน (My Profile) --</option>
              {employeesList.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.employeeCode} - {emp.firstName} {emp.lastName} ({emp.department?.name || 'ทั่วไป'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-gray-200/80 p-1 rounded-xl max-w-md print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('payslip')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'payslip' 
              ? 'bg-white text-emerald-700 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          1. สลิปเงินเดือนรายงวด (Payslips)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('50tawi')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === '50tawi' 
              ? 'bg-white text-blue-700 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          2. หนังสือรับรอง 50 ทวิ (Tax 50 Tawi)
        </button>
      </div>

      {/* Missing Citizen ID Alert Banner */}
      {employeeInfo && (employeeInfo.hasValidIdCard === false || !employeeInfo.idCard) && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-start gap-3 shadow-xs print:hidden">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-900">
              ⚠️ ยังไม่ได้ระบุเลขประจำตัวประชาชน 13 หลัก
            </h4>
            <p className="text-xs text-amber-800 mt-1">
              ข้อมูลประวัติบุคลากรของ <b>{employeeInfo.fullName}</b> ยังไม่มีเลขประจำตัวประชาชน 13 หลักที่ถูกต้องในระบบ 
              โปรดบันทึกเลขบัตรประชาชนในระบบทะเบียนประวัติพนักงาน เพื่อให้การออกหนังสือรับรองภาษี 50 ทวิ และเอกสารทางราชการถูกต้องตามกฎหมาย
            </p>
          </div>
        </div>
      )}

      {/* Employee Quick Info Card */}
      {employeeInfo ? (
        <Card className="border shadow-xs bg-white print:hidden !overflow-visible relative z-30">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4 !overflow-visible">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg border border-emerald-200">
                {employeeInfo.fullName.slice(0, 2)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  {employeeInfo.fullName}
                  <Badge variant="secondary" className="text-[11px] font-mono">
                    {employeeInfo.employeeCode}
                  </Badge>
                </h3>
                <p className="text-xs text-gray-500">
                  {employeeInfo.position} • {employeeInfo.department} ({employeeInfo.employeeType})
                </p>
              </div>
            </div>

            {/* Filter controls per tab */}
            <div className="flex items-center gap-2 flex-wrap">
              {activeTab === 'payslip' ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> งวดเงินเดือน:
                  </span>
                  <PayrollTreeSelector
                    records={availableRecords}
                    selectedRecordId={selectedRecordId}
                    onSelectRecord={setSelectedRecordId}
                  />
                </div>
              ) : (
                <>
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> เลือกปีภาษี:
                  </span>
                  <select
                    className="h-9 text-xs border rounded-md px-3 bg-gray-50 font-semibold text-gray-800 cursor-pointer"
                    value={selectedTaxYear}
                    onChange={e => setSelectedTaxYear(e.target.value)}
                  >
                    <option value="2026">ปีภาษี พ.ศ. 2569 (2026)</option>
                    <option value="2025">ปีภาษี พ.ศ. 2568 (2025)</option>
                    <option value="2024">ปีภาษี พ.ศ. 2567 (2024)</option>
                  </select>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* UNLINKED ACCOUNT VIEW: When Admin / User is not linked to an employee */}
      {!loading && !employeeInfo && selectedEmployeeId === 'me' && (
        <Card className="border-2 border-dashed border-indigo-200 bg-gradient-to-b from-indigo-50/40 via-blue-50/20 to-white shadow-xs rounded-2xl p-8 md:p-12 text-center print:hidden">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-indigo-200">
              <User className="w-8 h-8" />
            </div>

            <div>
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 mb-2 font-semibold text-xs">
                ⚠️ บัญชีไม่ได้ผูกกับรหัสพนักงาน
              </Badge>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                บัญชีผู้ใช้งานนี้ยังไม่ได้เชื่อมโยงกับประวัติบุคลากร
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                คุณกำลังเข้าสู่ระบบด้วยบัญชีระดับผู้ดูแลระบบ (<b>System Administrator / Admin</b>) ซึ่งเป็นบัญชีบริหารจัดการระบบกลางที่ไม่ได้ผูกกับรหัสบุคลากรใด จึงไม่มีข้อมูลสลิปเงินเดือนหรือหนังสือรับรองภาษี 50 ทวิส่วนบุคคล
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-indigo-100 text-left text-xs space-y-3 shadow-xs mt-6">
              <p className="font-bold text-indigo-900 flex items-center gap-1.5 text-sm">
                💡 คำแนะนำสำหรับการเรียกดูข้อมูล:
              </p>
              <div className="space-y-2.5 text-gray-700">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs border border-indigo-200">1</span>
                  <p className="leading-relaxed">
                    <b>หากต้องการตรวจสอบสลิปเงินเดือนหรือพิมพ์ใบ 50 ทวิของเจ้าหน้าที่:</b> ให้เลือกรายชื่อพนักงานจากเมนู <b>"สลับดูพนักงาน"</b> ที่มุมขวาบน
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs border border-indigo-200">2</span>
                  <p className="leading-relaxed">
                    <b>หากต้องการให้บัญชีนี้มีสลิปเงินเดือนส่วนบุคคล:</b> ไปที่เมนู <a href="/users" className="text-indigo-600 underline font-bold hover:text-indigo-800">จัดการผู้ใช้งาน (Users)</a> แล้วกด <b>แก้ไข</b> เพื่อเลือกผูกบัญชีเข้ากับรหัสพนักงานของคุณ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 1: PAYSLIP VIEW (When employee is selected or linked) */}
      {activeTab === 'payslip' && (employeeInfo || selectedEmployeeId !== 'me') && (
        <>
          {loading ? (
            <Card className="border shadow-xs bg-white">
              <CardContent className="py-24 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin mb-3"></div>
                <h4 className="text-sm font-bold text-gray-800">กำลังโหลดข้อมูลสลิปเงินเดือน...</h4>
                <p className="text-xs text-gray-400 mt-1">กำลังรวบรวมรายการได้และรายการหัก</p>
              </CardContent>
            </Card>
          ) : !currentPayslip ? (
            <Card className="border shadow-xs bg-white">
              <CardContent className="py-20 text-center text-gray-400">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-medium">ยังไม่พบประวัติการจ่ายเงินเดือนของพนักงานท่านนี้ในระบบ</p>
              </CardContent>
            </Card>
          ) : (
            <PayslipTemplate 
              employee={employeeInfo} 
              payslip={currentPayslip} 
              onPrint={handlePrintPayslip}
            />
          )}
        </>
      )}

      {/* TAB 2: 50 TAWI CERTIFICATE VIEW (When employee is selected or linked) */}
      {activeTab === '50tawi' && (employeeInfo || selectedEmployeeId !== 'me') && (
        <>
          {tawiLoading ? (
            <Card className="border shadow-xs bg-white">
              <CardContent className="py-24 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin mb-3"></div>
                <h4 className="text-sm font-bold text-gray-800">กำลังคำนวณและประมวลผลแบบ 50 ทวิ...</h4>
                <p className="text-xs text-gray-400 mt-1">รวมยอดเงินได้สะสมทั้งปีและภาษีหักนำส่ง</p>
              </CardContent>
            </Card>
          ) : !tawiData ? (
            <Card className="border shadow-xs bg-white">
              <CardContent className="py-20 text-center text-gray-400">
                <ShieldCheck className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-medium">ไม่พบข้อมูลภาษีประจำปีของพนักงานท่านนี้</p>
              </CardContent>
            </Card>
          ) : (
            <Form50Tawi 
              data={tawiData} 
              onPrint={handlePrint50Tawi}
            />
          )}
        </>
      )}
    </div>
  );
}
