"use client";
import { API_URL } from "@/lib/config";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Calendar, 
  Search, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown, 
  BarChart3, 
  Building2, 
  Briefcase, 
  Tag, 
  DollarSign, 
  Layers,
  Users,
  Percent
} from "lucide-react";
import { toast } from "sonner";

export default function ReportsCenterPage() {
  const router = useRouter();

  // Control Bar States
  const [reportTab, setReportTab] = useState<'summary' | 'department' | 'employeeType' | 'headcount' | 'tax'>('summary');
  const [periodType, setPeriodType] = useState<'latest' | 'monthly' | 'quarterly' | 'fiscalYear' | 'calendarYear'>('latest');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedQuarter, setSelectedQuarter] = useState('1');
  const [searchTerm, setSearchTerm] = useState("");

  // Data States
  const [summaryData, setSummaryData] = useState<any>(null);
  const [departmentData, setDepartmentData] = useState<any>(null);
  const [employeeTypeData, setEmployeeTypeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Accordion Expand States
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [groupDetails, setGroupDetails] = useState<Record<string, any[]>>({});
  const [loadingGroups, setLoadingGroups] = useState<Set<string>>(new Set());

  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const params: any = { periodType };

      if (periodType === 'monthly') {
        params.year = selectedYear;
        params.month = selectedMonth;
      } else if (periodType === 'quarterly') {
        params.year = selectedYear;
        params.quarter = selectedQuarter;
      } else if (periodType === 'fiscalYear') {
        params.fiscalYear = selectedYear;
      } else if (periodType === 'calendarYear') {
        params.year = selectedYear;
      }

      const [sumRes, deptRes, typeRes] = await Promise.all([
        axios.get(`${API_URL}/reports/executive/summary`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/reports/executive/by-dimension`, { params: { ...params, dimension: 'department' }, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/reports/executive/by-dimension`, { params: { ...params, dimension: 'employeeType' }, headers: { Authorization: `Bearer ${token}` } })
      ]);

      setSummaryData(sumRes.data);
      setDepartmentData(deptRes.data);
      setEmployeeTypeData(typeRes.data);
      setExpandedGroups(new Set());
      setGroupDetails({});
    } catch (e) {
      console.error(e);
      toast.error("ดึงข้อมูลรายงานไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [periodType, selectedYear, selectedMonth, selectedQuarter]);

  const toggleExpandGroup = async (groupId: string, dimension: 'department' | 'employeeType') => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
      setExpandedGroups(newExpanded);
      return;
    }

    newExpanded.add(groupId);
    setExpandedGroups(newExpanded);

    if (!groupDetails[groupId]) {
      setLoadingGroups(prev => new Set(prev).add(groupId));
      try {
        const token = Cookies.get("token");
        const params: any = { periodType };
        if (periodType === 'monthly') {
          params.year = selectedYear;
          params.month = selectedMonth;
        }

        if (dimension === 'department') params.departmentId = groupId;
        else if (dimension === 'employeeType') params.employeeTypeId = groupId;

        const res = await axios.get(`${API_URL}/reports/executive/drilldown`, {
          params,
          headers: { Authorization: `Bearer ${token}` }
        });

        setGroupDetails(prev => ({ ...prev, [groupId]: res.data.employees || [] }));
      } catch (e) {
        toast.error("ดึงรายละเอียดกลุ่มงานไม่สำเร็จ");
      } finally {
        setLoadingGroups(prev => {
          const next = new Set(prev);
          next.delete(groupId);
          return next;
        });
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    let exportRows: any[] = [];
    let sheetName = "Report";

    if (reportTab === 'summary' || reportTab === 'department') {
      sheetName = "Department_Cost";
      exportRows = (departmentData?.items || []).map((d: any, idx: number) => ({
        'ลำดับ': idx + 1,
        'กลุ่มงาน': d.name,
        'จำนวนคน': d.headcount,
        'เงินเดือนหลัก (บาท)': d.baseSalary,
        'ค่าเวรและ OT (บาท)': d.otShift,
        'เงินเพิ่มพิเศษ (บาท)': d.specialAllowance,
        'เงินได้รวม (บาท)': d.totalGross,
        'เงินหักรวม (บาท)': d.totalDeductions,
        'รับสุทธิ (บาท)': d.totalNet,
        'สัดส่วน (%)': d.sharePercent,
        'เฉลี่ย/คน (บาท)': d.avgNetPerHead
      }));
    } else if (reportTab === 'employeeType') {
      sheetName = "EmployeeType_Cost";
      exportRows = (employeeTypeData?.items || []).map((t: any, idx: number) => ({
        'ลำดับ': idx + 1,
        'ประเภทพนักงาน': t.name,
        'จำนวนคน': t.headcount,
        'เงินเดือนหลัก (บาท)': t.baseSalary,
        'ค่าเวรและ OT (บาท)': t.otShift,
        'เงินเพิ่มพิเศษ (บาท)': t.specialAllowance,
        'เงินได้รวม (บาท)': t.totalGross,
        'เงินหักรวม (บาท)': t.totalDeductions,
        'รับสุทธิ (บาท)': t.totalNet,
        'สัดส่วน (%)': t.sharePercent,
        'เฉลี่ย/คน (บาท)': t.avgNetPerHead
      }));
    }

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `Hospital_Payroll_${sheetName}_${selectedYear}.xlsx`);
    toast.success("ส่งออกไฟล์ Excel สำเร็จ");
  };

  const metrics = summaryData?.metrics;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16 print:p-0 print:m-0 print:max-w-none">
      {/* Official Thai Print Header */}
      <div className="hidden print:block text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src="/logo.jpg" alt="Logo" className="w-14 h-14 object-contain" />
          <div>
            <h1 className="text-xl font-bold font-serif text-black">โรงพยาบาลสามโคก (Samkok Hospital)</h1>
            <p className="text-sm font-serif text-gray-700">รายงานสรุปค่าใช้จ่ายบุคลากรและการเงินประจำงวด</p>
          </div>
        </div>
        <h2 className="text-base font-bold font-serif text-black mt-2">
          {summaryData?.periodLabel || 'รายงานค่าใช้จ่ายบุคลากร'}
        </h2>
        <p className="text-xs font-serif text-gray-600">
          พิมพ์เมื่อวันที่: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileSpreadsheet className="w-7 h-7 text-emerald-600" /> ศูนย์รวมรายงานผู้บริหาร (Reports Center)
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
              Official Reports
            </Badge>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            ตารางรายงานทางการ พร้อมระบบคลี่ดูข้อมูลย่อย (Tree Accordion) และพิมพ์รายงานราชการ
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200"
            onClick={() => router.push('/dashboard/analytics')}
          >
            <BarChart3 className="w-4 h-4 mr-1.5" />
            ดูแดชบอร์ดภาพรวม
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-1.5" />
            พิมพ์รายงาน
          </Button>

          <Button 
            size="sm" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-medium"
            onClick={handleExportExcel}
          >
            <Download className="w-4 h-4 mr-1.5" />
            ส่งออก Excel
          </Button>
        </div>
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <Card className="border shadow-xs bg-white print:hidden">
        <CardContent className="p-4 space-y-3">
          {/* Row 1: Time Presets */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> มิติเวลา:
              </span>
              <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
                {[
                  { id: 'latest', label: 'งวดล่าสุด' },
                  { id: 'monthly', label: 'รายเดือน' },
                  { id: 'quarterly', label: 'รายไตรมาส' },
                  { id: 'fiscalYear', label: 'ปีงบประมาณ' },
                  { id: 'calendarYear', label: 'ปีปฏิทิน' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPeriodType(p.id as any)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                      periodType === p.id 
                        ? 'bg-white text-emerald-700 shadow-xs' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selectors */}
            <div className="flex items-center gap-2 flex-wrap">
              {periodType === 'monthly' && (
                <>
                  <select 
                    className="h-8 text-xs border rounded-md px-2 bg-white font-medium"
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                  >
                    {monthNames.map((m, i) => (
                      <option key={i} value={(i + 1).toString()}>{m}</option>
                    ))}
                  </select>
                  <select 
                    className="h-8 text-xs border rounded-md px-2 bg-white font-medium"
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                  >
                    <option value="2026">พ.ศ. 2569 (2026)</option>
                    <option value="2025">พ.ศ. 2568 (2025)</option>
                    <option value="2024">พ.ศ. 2567 (2024)</option>
                  </select>
                </>
              )}

              {(periodType === 'fiscalYear' || periodType === 'calendarYear') && (
                <select 
                  className="h-8 text-xs border rounded-md px-2 bg-white font-medium"
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                >
                  <option value="2026">ปี พ.ศ. 2569</option>
                  <option value="2025">ปี พ.ศ. 2568</option>
                </select>
              )}

              {summaryData?.periodLabel && (
                <span className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                  {summaryData.periodLabel}
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Report Type Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'summary', label: '1. สรุปภาพรวมรายกลุ่มงาน', icon: Building2 },
                { id: 'employeeType', label: '2. สรุปตามประเภทการจ้าง', icon: Tag },
                { id: 'headcount', label: '3. สรุปอัตรากำลัง & รายได้เฉลี่ย', icon: Users },
                { id: 'tax', label: '4. สรุปภาษี & เงินสะสมกองทุน', icon: DollarSign }
              ].map(tab => (
                <Button
                  key={tab.id}
                  variant={reportTab === tab.id ? "default" : "outline"}
                  size="sm"
                  className={`h-8 text-xs font-medium ${
                    reportTab === tab.id 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setReportTab(tab.id as any)}
                >
                  <tab.icon className="w-3.5 h-3.5 mr-1" />
                  {tab.label}
                </Button>
              ))}
            </div>

            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <Input 
                placeholder="ค้นหาชื่อแผนก/กลุ่มงาน..." 
                className="h-8 pl-8 text-xs bg-gray-50"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPI Banner */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border shadow-xs print:grid-cols-4 print:border-black">
          <div className="border-r pr-3">
            <span className="text-xs text-gray-500 font-medium">ยอดจ่ายสุทธิรวม</span>
            <div className="text-lg font-bold text-gray-900">฿{metrics.totalNetPayout.toLocaleString()}</div>
          </div>
          <div className="border-r pr-3">
            <span className="text-xs text-gray-500 font-medium">อัตรากำลังรวม</span>
            <div className="text-lg font-bold text-emerald-700">{metrics.totalHeadcount} คน</div>
          </div>
          <div className="border-r pr-3">
            <span className="text-xs text-gray-500 font-medium">ค่าเวร & OT รวม</span>
            <div className="text-lg font-bold text-amber-600">฿{metrics.otShiftTotal.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">เฉลี่ยสุทธิ/คน</span>
            <div className="text-lg font-bold text-blue-700">฿{metrics.avgNetPerHead.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Main Report Table */}
      <Card className="border shadow-xs bg-white overflow-hidden print:border-black print:shadow-none">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="bg-gray-50/90 print:bg-gray-100">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead className="font-bold text-gray-800">
                {reportTab === 'employeeType' ? 'ประเภทการจ้างงาน' : 'กลุ่มงาน / แผนก'}
              </TableHead>
              <TableHead className="text-center font-bold text-gray-800">จำนวนคน</TableHead>
              <TableHead className="text-right font-bold text-gray-800">เงินเดือนหลัก</TableHead>
              <TableHead className="text-right font-bold text-gray-800">ค่าเวร & OT</TableHead>
              <TableHead className="text-right font-bold text-gray-800">เงินเพิ่มพิเศษ</TableHead>
              <TableHead className="text-right font-bold text-gray-800">เงินได้รวม</TableHead>
              <TableHead className="text-right font-bold text-gray-800">เงินหักรวม</TableHead>
              <TableHead className="text-right font-bold text-gray-900 bg-blue-50/60">ยอดจ่ายสุทธิ (Net)</TableHead>
              <TableHead className="text-right font-bold text-gray-800">สัดส่วน (%)</TableHead>
              <TableHead className="text-right font-bold text-gray-800">เฉลี่ย/คน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="py-16 text-center text-gray-500">
                  กำลังโหลดข้อมูลรายงาน...
                </TableCell>
              </TableRow>
            ) : (reportTab === 'employeeType' ? employeeTypeData?.items : departmentData?.items)?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-16 text-center text-gray-400">
                  ไม่พบข้อมูลรายงานสำหรับเงื่อนไขนี้
                </TableCell>
              </TableRow>
            ) : (
              (reportTab === 'employeeType' ? employeeTypeData?.items : departmentData?.items)
                ?.filter((item: any) => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item: any, idx: number) => {
                  const isExpanded = expandedGroups.has(item.id);
                  const isDimensionDept = reportTab !== 'employeeType';
                  const details = groupDetails[item.id] || [];
                  const isLoadingDetails = loadingGroups.has(item.id);

                  return (
                    <React.Fragment key={item.id || idx}>
                      {/* Master Group Row */}
                      <TableRow 
                        className={`hover:bg-gray-50 transition-colors font-medium ${isExpanded ? 'bg-blue-50/30' : ''}`}
                      >
                        <TableCell className="text-center text-gray-400">{idx + 1}</TableCell>
                        <TableCell>
                          <button
                            type="button"
                            className="flex items-center gap-1.5 font-bold text-gray-900 hover:text-blue-600 text-left print:pointer-events-none"
                            onClick={() => toggleExpandGroup(item.id, isDimensionDept ? 'department' : 'employeeType')}
                          >
                            <span className="text-gray-400 print:hidden">
                              {isExpanded ? <ChevronDown className="w-4 h-4 text-blue-600" /> : <ChevronRight className="w-4 h-4" />}
                            </span>
                            <span>{item.name}</span>
                          </button>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-gray-700">{item.headcount}</TableCell>
                        <TableCell className="text-right text-gray-700">฿{item.baseSalary.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-amber-700">฿{item.otShift.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-purple-700">฿{item.specialAllowance.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium text-gray-800">฿{item.totalGross.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-rose-600">-฿{item.totalDeductions.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-bold text-blue-700 bg-blue-50/50">
                          ฿{item.totalNet.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-gray-600">{item.sharePercent}%</TableCell>
                        <TableCell className="text-right font-semibold text-gray-800">฿{item.avgNetPerHead.toLocaleString()}</TableCell>
                      </TableRow>

                      {/* Expandable Sub-table (Drill-Down Level) */}
                      {isExpanded && (
                        <TableRow className="bg-gray-50/60 print:bg-white">
                          <TableCell colSpan={11} className="p-3 pl-8">
                            <div className="border rounded-md bg-white p-3 shadow-xs">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-blue-600" />
                                  รายชื่อและรายการรับ-หักของบุคลากรใน {item.name} ({details.length} คน)
                                </span>
                              </div>

                              {isLoadingDetails ? (
                                <div className="py-6 text-center text-gray-400 text-xs">กำลังโหลดรายละเอียด...</div>
                              ) : details.length === 0 ? (
                                <div className="py-4 text-center text-gray-400 text-xs">ไม่มีรายละเอียด</div>
                              ) : (
                                <Table className="text-xs">
                                  <TableHeader>
                                    <TableRow className="bg-gray-100 text-gray-600">
                                      <TableHead className="w-10 text-center">#</TableHead>
                                      <TableHead>รหัส</TableHead>
                                      <TableHead>ชื่อ - นามสกุล</TableHead>
                                      <TableHead>ตำแหน่ง</TableHead>
                                      <TableHead>ประเภท</TableHead>
                                      <TableHead className="text-right">เงินได้รวม</TableHead>
                                      <TableHead className="text-right">เงินหักรวม</TableHead>
                                      <TableHead className="text-right font-bold text-blue-900">รับสุทธิ</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {details.map((emp: any, eIdx: number) => (
                                      <TableRow key={emp.employeeId || eIdx} className="hover:bg-gray-50">
                                        <TableCell className="text-center text-gray-400">{eIdx + 1}</TableCell>
                                        <TableCell className="font-medium text-gray-700">{emp.employeeCode}</TableCell>
                                        <TableCell className="font-semibold text-gray-900">{emp.firstName} {emp.lastName}</TableCell>
                                        <TableCell className="text-gray-600">{emp.position}</TableCell>
                                        <TableCell className="text-gray-600">{emp.employeeType}</TableCell>
                                        <TableCell className="text-right text-gray-700">฿{emp.grossIncome.toLocaleString()}</TableCell>
                                        <TableCell className="text-right text-rose-600">-฿{emp.totalDeductions.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-bold text-blue-700">฿{emp.netAmount.toLocaleString()}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
            )}
          </TableBody>
          {/* Grand Total Footer */}
          {!loading && (departmentData?.grandTotal || employeeTypeData?.grandTotal) && (
            <TableFooter>
              <TableRow className="bg-gray-100 font-bold text-gray-900 text-xs">
                <TableCell colSpan={2} className="text-center font-bold">รวมทั้งสิ้น (Grand Total)</TableCell>
                <TableCell className="text-center">
                  {(reportTab === 'employeeType' ? employeeTypeData : departmentData)?.grandTotal.headcount} คน
                </TableCell>
                <TableCell colSpan={3} className="text-center text-gray-500">-</TableCell>
                <TableCell className="text-right text-gray-900">
                  ฿{(reportTab === 'employeeType' ? employeeTypeData : departmentData)?.grandTotal.gross.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-rose-600">
                  -฿{(reportTab === 'employeeType' ? employeeTypeData : departmentData)?.grandTotal.deductions.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-extrabold text-blue-800 bg-blue-100/70">
                  ฿{(reportTab === 'employeeType' ? employeeTypeData : departmentData)?.grandTotal.net.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">100.0%</TableCell>
                <TableCell className="text-right">
                  ฿{(reportTab === 'employeeType' ? employeeTypeData : departmentData)?.grandTotal.avgNetPerHead.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </Card>
    </div>
  );
}
