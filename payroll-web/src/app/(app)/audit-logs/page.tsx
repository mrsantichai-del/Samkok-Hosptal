"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  ScrollText, 
  Search, 
  RefreshCw, 
  Calendar, 
  Filter, 
  Eye, 
  Printer, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  User, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Activity, 
  Sparkles,
  Download,
  Laptop
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");
  const [filterModule, setFilterModule] = useState("ALL");
  const [filterDateRange, setFilterDateRange] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Diff Modal State
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);

  // Calculate Date bounds based on range
  const dateParams = useMemo(() => {
    if (filterDateRange === "TODAY") {
      const today = new Date().toISOString().split("T")[0];
      return { startDate: today, endDate: today };
    } else if (filterDateRange === "7DAYS") {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      return { startDate: past.toISOString().split("T")[0] };
    } else if (filterDateRange === "30DAYS") {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      return { startDate: past.toISOString().split("T")[0] };
    }
    return {};
  }, [filterDateRange]);

  // Fetch Logs Data
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_URL}/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: 20,
          search: search || undefined,
          action: filterAction !== "ALL" ? filterAction : undefined,
          tableName: filterModule !== "ALL" ? filterModule : undefined,
          ...dateParams
        }
      });

      setLogs(res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalCount(res.data?.pagination?.total || 0);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "ไม่สามารถโหลดประวัติการใช้งานได้");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Stats Data
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_URL}/audit-logs/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data || null);
    } catch (e) {
      // Ignored
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filterAction, filterModule, filterDateRange]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };

  // Export Logs to Excel
  const handleExportExcel = () => {
    if (logs.length === 0) {
      toast.error("ไม่มีข้อมูลที่จะส่งออก");
      return;
    }

    const exportRows = logs.map((log, idx) => ({
      "ลำดับ": idx + 1,
      "วัน-เวลา": new Date(log.createdAt).toLocaleString("th-TH"),
      "ผู้ดำเนินการ": log.user ? `${log.user.username} (${log.user.employee ? `${log.user.employee.firstName} ${log.user.employee.lastName}` : 'Admin'})` : "ระบบ (System)",
      "ประเภทกิจกรรม": log.action,
      "โมดูล/ตาราง": log.tableName,
      "รหัสอ้างอิง": log.recordId,
      "คำอธิบาย / เหตุผล": log.reason || "-",
      "IP Address": log.ipAddress || "-"
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit_Logs");
    XLSX.writeFile(wb, `Audit_Logs_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("ส่งออกไฟล์ Excel สำเร็จ");
  };

  // Action Badge Renderer
  const renderActionBadge = (action: string) => {
    const act = (action || "").toUpperCase();
    if (act.includes("PRINT")) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-semibold gap-1 text-[11px]">
          <Printer className="w-3 h-3" /> {action}
        </Badge>
      );
    }
    if (act.includes("CREATE") || act.includes("INSERT") || act.includes("ADD")) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold gap-1 text-[11px]">
          <Plus className="w-3 h-3" /> {action}
        </Badge>
      );
    }
    if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("MODIFY") || act.includes("CALCULATE")) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-semibold gap-1 text-[11px]">
          <Edit className="w-3 h-3" /> {action}
        </Badge>
      );
    }
    if (act.includes("DELETE") || act.includes("REMOVE")) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300 font-semibold gap-1 text-[11px]">
          <Trash2 className="w-3 h-3" /> {action}
        </Badge>
      );
    }
    if (act.includes("APPROVE")) {
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-300 font-semibold gap-1 text-[11px]">
          <CheckCircle2 className="w-3 h-3" /> {action}
        </Badge>
      );
    }
    if (act.includes("REJECT") || act.includes("CANCEL")) {
      return (
        <Badge className="bg-rose-100 text-rose-800 border-rose-300 font-semibold gap-1 text-[11px]">
          <XCircle className="w-3 h-3" /> {action}
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-300 font-semibold gap-1 text-[11px]">
        <Activity className="w-3 h-3" /> {action}
      </Badge>
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
              <ScrollText className="w-7 h-7 text-indigo-600" />
              ประวัติการใช้งานและตรวจสอบระบบ (Audit & Activity Logs)
            </h1>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-800 border-indigo-200">
              System Audit Trail
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            บันทึกประวัติการเข้าใช้งาน การแก้ไขข้อมูล การอนุมัติ และการพิมพ์เอกสารราชการแบบเรียลไทม์เพื่อการตรวจสอบย้อนหลัง
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { fetchStats(); fetchLogs(); }}
            className="cursor-pointer bg-white"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" /> รีเฟรช
          </Button>

          <Button 
            size="sm" 
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            <Download className="w-4 h-4 mr-1.5" /> ส่งออก Excel
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white shadow-2xs border-l-4 border-l-indigo-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500">กิจกรรมทั้งหมดในระบบ</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                {statsLoading ? "..." : (stats?.totalLogs || 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <ScrollText className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-2xs border-l-4 border-l-blue-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500">กิจกรรมวันนี้ (Today)</p>
              <h3 className="text-2xl font-black text-blue-700 mt-0.5">
                {statsLoading ? "..." : (stats?.todayLogs || 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-2xs border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500">การสั่งพิมพ์เอกสาร (Print)</p>
              <h3 className="text-2xl font-black text-amber-700 mt-0.5">
                {statsLoading ? "..." : (stats?.printLogs || 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Printer className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-2xs border-l-4 border-l-purple-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500">การอนุมัติจ่ายเงินเดือน</p>
              <h3 className="text-2xl font-black text-purple-700 mt-0.5">
                {statsLoading ? "..." : (stats?.approveLogs || 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card & Filter Bar */}
      <Card className="bg-white shadow-sm border-gray-200">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="ค้นหาคำอธิบาย, รหัส, IP..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Action Filter */}
            <div className="flex items-center gap-1.5">
              <Label className="text-xs font-semibold whitespace-nowrap text-gray-600">กิจกรรม:</Label>
              <select 
                className="h-9 border rounded-md px-2 text-xs bg-gray-50 cursor-pointer font-medium"
                value={filterAction} 
                onChange={(e) => { setFilterAction(e.target.value); setCurrentPage(1); }}
              >
                <option value="ALL">ทั้งหมด (All Actions)</option>
                <option value="PRINT">🖨️ พิมพ์เอกสาร (PRINT)</option>
                <option value="VIEW">👁️ เข้าดู (VIEW)</option>
                <option value="CREATE">➕ เพิ่มข้อมูล (CREATE)</option>
                <option value="UPDATE">✏️ แก้ไข (UPDATE)</option>
                <option value="DELETE">🗑️ ลบข้อมูล (DELETE)</option>
                <option value="APPROVE">✅ อนุมัติ (APPROVE)</option>
                <option value="REJECT">↩️ ส่งกลับแก้ไข (REJECT)</option>
              </select>
            </div>

            {/* Module Filter */}
            <div className="flex items-center gap-1.5">
              <Label className="text-xs font-semibold whitespace-nowrap text-gray-600">โมดูล:</Label>
              <select 
                className="h-9 border rounded-md px-2 text-xs bg-gray-50 cursor-pointer font-medium"
                value={filterModule} 
                onChange={(e) => { setFilterModule(e.target.value); setCurrentPage(1); }}
              >
                <option value="ALL">ทั้งหมด (All Modules)</option>
                <option value="Payroll">💵 งวดเงินเดือน (Payroll)</option>
                <option value="Payslip">📄 สลิปเงินเดือน (Payslip)</option>
                <option value="Employee">👥 บุคลากร (Employee)</option>
                <option value="User">🔑 ผู้ใช้งาน (User)</option>
                <option value="Role">🛡️ กลุ่มสิทธิ์ (Role)</option>
                <option value="PayItem">⚙️ รายรับ-รายจ่าย (PayItem)</option>
                <option value="Settings">🏥 ตั้งค่าระบบ (Settings)</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-1.5">
              <Label className="text-xs font-semibold whitespace-nowrap text-gray-600">ช่วงเวลา:</Label>
              <select 
                className="h-9 border rounded-md px-2 text-xs bg-gray-50 cursor-pointer font-medium"
                value={filterDateRange} 
                onChange={(e) => { setFilterDateRange(e.target.value); setCurrentPage(1); }}
              >
                <option value="ALL">ทั้งหมด</option>
                <option value="TODAY">วันนี้ (Today)</option>
                <option value="7DAYS">7 วันล่าสุด</option>
                <option value="30DAYS">30 วันล่าสุด</option>
              </select>
            </div>

            <Button type="submit" size="sm" className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700">
              ค้นหา
            </Button>
          </form>

          <div className="text-xs text-gray-500 font-medium">
            พบทั้งหมด <span className="font-bold text-gray-900">{totalCount.toLocaleString()}</span> รายการ
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead className="w-40 font-bold">วัน-เวลา (Timestamp)</TableHead>
                <TableHead className="w-48 font-bold">ผู้ดำเนินการ (User)</TableHead>
                <TableHead className="w-36 font-bold">ประเภทกิจกรรม</TableHead>
                <TableHead className="w-36 font-bold">โมดูลเป้าหมาย</TableHead>
                <TableHead className="font-bold">รายละเอียด / หมายเหตุ</TableHead>
                <TableHead className="w-28 font-bold">IP Address</TableHead>
                <TableHead className="w-28 text-center font-bold">ข้อมูลก่อน-หลัง</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                      กำลังโหลดประวัติกิจกรรม...
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center text-gray-400">
                    ไม่พบรายการประวัติการใช้งานตามเงื่อนไขที่เลือก
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, idx) => {
                  const logDate = new Date(log.createdAt);
                  const userDisplay = log.user ? (
                    <div>
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        {log.user.username}
                      </div>
                      <div className="text-[10.5px] text-gray-500">
                        {log.user.employee 
                          ? `${log.user.employee.firstName} ${log.user.employee.lastName}` 
                          : log.user.roles?.[0]?.role?.name || 'System Admin'}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 font-medium italic">ระบบอัตโนมัติ (System)</span>
                  );

                  const hasDiff = Boolean(log.oldData || log.newData);

                  return (
                    <TableRow key={log.id} className="hover:bg-gray-50/70 transition-colors">
                      <TableCell className="text-center text-gray-400 font-mono">
                        {(currentPage - 1) * 20 + idx + 1}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-medium text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{logDate.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })}</span>
                          <span className="text-gray-400 font-mono text-[11px]">{logDate.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                        </div>
                      </TableCell>
                      <TableCell>{userDisplay}</TableCell>
                      <TableCell>{renderActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-50 font-medium text-gray-800">
                          {log.tableName}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="text-gray-900 font-medium leading-relaxed">
                          {log.reason || `ดำเนินการกับรายการรหัส ${log.recordId}`}
                        </div>
                        {log.recordId && log.recordId !== 'N/A' && (
                          <div className="text-[10.5px] text-gray-400 font-mono">
                            Ref: {log.recordId}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-500 font-mono text-[11px]">
                        {log.ipAddress ? (
                          <span className="flex items-center gap-1">
                            <Laptop className="w-3 h-3 text-gray-400" />
                            {log.ipAddress}
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {hasDiff ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => { setSelectedLog(log); setIsDiffModalOpen(true); }}
                            className="h-7 text-[11px] text-indigo-600 border-indigo-200 hover:bg-indigo-50 cursor-pointer"
                          >
                            <Eye className="w-3 h-3 mr-1" /> ดูข้อมูล
                          </Button>
                        ) : (
                          <span className="text-gray-300 text-[11px]">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              หน้า <span className="font-bold text-gray-900">{currentPage}</span> จาก <span className="font-bold text-gray-900">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="h-8 text-xs cursor-pointer"
              >
                ก่อนหน้า
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="h-8 text-xs cursor-pointer"
              >
                ถัดไป
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* DIFF VIEW MODAL */}
      {/* ========================================================================= */}
      {selectedLog && (
        <Dialog open={isDiffModalOpen} onOpenChange={setIsDiffModalOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-indigo-600" />
                รายละเอียดข้อมูลกิจกรรมก่อน-หลัง (Diff View)
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                กิจกรรม: <b className="text-gray-800">{selectedLog.action}</b> บนโมดูล <b className="text-gray-800">{selectedLog.tableName}</b> เมื่อ {new Date(selectedLog.createdAt).toLocaleString("th-TH")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              {/* Event Meta Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50 p-3 rounded-lg border text-xs">
                <div>
                  <span className="text-gray-500 block text-[10.5px]">ผู้ดำเนินการ:</span>
                  <span className="font-bold text-gray-900">{selectedLog.user?.username || 'System'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10.5px]">ประเภท:</span>
                  <span className="font-bold text-gray-900">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10.5px]">โมดูล:</span>
                  <span className="font-bold text-gray-900">{selectedLog.tableName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10.5px]">IP Address:</span>
                  <span className="font-bold text-gray-900 font-mono">{selectedLog.ipAddress || '-'}</span>
                </div>
              </div>

              {/* Side by Side Diff Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Old Data Box */}
                <div className="border border-red-200 rounded-lg p-3 bg-red-50/30">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-red-200">
                    <span className="font-bold text-xs text-red-800 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-red-600" /> ข้อมูลเดิม (Old Value)
                    </span>
                  </div>
                  {selectedLog.oldData ? (
                    <pre className="text-[11px] font-mono text-gray-800 bg-white p-2.5 rounded border border-red-100 overflow-x-auto max-h-64">
                      {JSON.stringify(selectedLog.oldData, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-xs text-gray-400 italic py-4 text-center">ไม่มีข้อมูลเดิม (สร้างใหม่)</p>
                  )}
                </div>

                {/* New Data Box */}
                <div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50/30">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200">
                    <span className="font-bold text-xs text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ข้อมูลใหม่ (New Value)
                    </span>
                  </div>
                  {selectedLog.newData ? (
                    <pre className="text-[11px] font-mono text-gray-800 bg-white p-2.5 rounded border border-emerald-100 overflow-x-auto max-h-64">
                      {JSON.stringify(selectedLog.newData, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-xs text-gray-400 italic py-4 text-center">ไม่มีข้อมูลใหม่ (ลบรายการ)</p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsDiffModalOpen(false)}>
                ปิดหน้าต่าง
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
