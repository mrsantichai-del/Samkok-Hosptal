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
  Layers
} from "lucide-react";
import { toast } from "sonner";
import PayslipTemplate from "@/components/PayslipTemplate";
import Form50Tawi from "@/components/Form50Tawi";

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

      setEmployeeInfo(res.data.employee);
      setAvailableRecords(res.data.availableRecords || []);
      setCurrentPayslip(res.data.currentPayslip);

      if (!recordId && res.data.availableRecords?.length > 0) {
        setSelectedRecordId(res.data.availableRecords[0].id);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || "ไม่สามารถดึงข้อมูลสลิปเงินเดือนได้");
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

      setTawiData(res.data);
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || "ไม่สามารถดึงข้อมูลใบ 50 ทวิ ได้");
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

  const handlePrint = () => {
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

      {/* Employee Quick Info Card */}
      {employeeInfo && (
        <Card className="border shadow-xs bg-white print:hidden">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
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
                <>
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> เลือกงวดเงินเดือน:
                  </span>
                  <select
                    className="h-9 text-xs border rounded-md px-3 bg-gray-50 font-semibold text-gray-800 cursor-pointer min-w-[200px]"
                    value={selectedRecordId}
                    onChange={e => setSelectedRecordId(e.target.value)}
                  >
                    {availableRecords.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </>
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
      )}

      {/* TAB 1: PAYSLIP VIEW */}
      {activeTab === 'payslip' && (
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
                <p className="text-sm font-medium">ยังไม่พบประวัติการจ่ายเงินเดือนในระบบ</p>
              </CardContent>
            </Card>
          ) : (
            <PayslipTemplate 
              employee={employeeInfo} 
              payslip={currentPayslip} 
              onPrint={handlePrint}
            />
          )}
        </>
      )}

      {/* TAB 2: 50 TAWI CERTIFICATE VIEW */}
      {activeTab === '50tawi' && (
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
                <p className="text-sm font-medium">ไม่พบข้อมูลภาษีประจำปีนี้</p>
              </CardContent>
            </Card>
          ) : (
            <Form50Tawi 
              data={tawiData} 
              onPrint={handlePrint}
            />
          )}
        </>
      )}
    </div>
  );
}
