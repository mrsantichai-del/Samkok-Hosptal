"use client";
import { API_URL } from "@/lib/config";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Clock, 
  Building2, 
  Briefcase, 
  Tag, 
  Layers, 
  Calendar, 
  ArrowRight, 
  Search, 
  RefreshCw, 
  FileSpreadsheet, 
  ChevronRight, 
  Percent, 
  Sparkles,
  PieChart as PieIcon
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";
import { toast } from "sonner";

const COLORS = ['#1877f2', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#64748b', '#14b8a6', '#6366f1'];

export default function ExecutiveAnalyticsPage() {
  const router = useRouter();

  // Control Bar States
  const [periodType, setPeriodType] = useState<'latest' | 'monthly' | 'quarterly' | 'fiscalYear' | 'calendarYear'>('latest');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedQuarter, setSelectedQuarter] = useState('1');
  const [activeDimension, setActiveDimension] = useState<'department' | 'position' | 'employeeType' | 'payCategory'>('department');
  const [activeMetric, setActiveMetric] = useState<'amount' | 'percent' | 'avg' | 'headcount'>('amount');

  // Data States
  const [summaryData, setSummaryData] = useState<any>(null);
  const [dimensionData, setDimensionData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Drill-Down Modal State
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [drilldownTitle, setDrilldownTitle] = useState("");
  const [drilldownLoading, setDrilldownLoading] = useState(false);
  const [drilldownEmployees, setDrilldownEmployees] = useState<any[]>([]);
  const [drilldownSummary, setDrilldownSummary] = useState<any>(null);
  const [drilldownSearch, setDrilldownSearch] = useState("");

  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  const fetchAnalytics = async () => {
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

      const [sumRes, dimRes, trendRes] = await Promise.all([
        axios.get(`${API_URL}/reports/executive/summary`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/reports/executive/by-dimension`, { params: { ...params, dimension: activeDimension }, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/reports/executive/trend`, { params, headers: { Authorization: `Bearer ${token}` } })
      ]);

      setSummaryData(sumRes.data);
      setDimensionData(dimRes.data);
      setTrendData(trendRes.data?.dataPoints || []);
    } catch (e) {
      console.error(e);
      toast.error("ดึงข้อมูลการวิเคราะห์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [periodType, selectedYear, selectedMonth, selectedQuarter, activeDimension]);

  const handleDrilldown = async (item: any) => {
    setDrilldownTitle(item.name || "รายละเอียด");
    setDrilldownOpen(true);
    setDrilldownLoading(true);
    setDrilldownSearch("");

    try {
      const token = Cookies.get("token");
      const params: any = { periodType };
      if (periodType === 'monthly') {
        params.year = selectedYear;
        params.month = selectedMonth;
      }

      if (activeDimension === 'department') params.departmentId = item.id;
      else if (activeDimension === 'position') params.positionId = item.id;
      else if (activeDimension === 'employeeType') params.employeeTypeId = item.id;

      const res = await axios.get(`${API_URL}/reports/executive/drilldown`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      setDrilldownEmployees(res.data.employees || []);
      setDrilldownSummary(res.data.summary || null);
    } catch (e) {
      console.error(e);
      toast.error("ไม่สามารถเจาะลึกข้อมูลได้");
    } finally {
      setDrilldownLoading(false);
    }
  };

  // Chart data formatting based on active metric
  const chartData = useMemo(() => {
    if (!dimensionData?.items) return [];
    return dimensionData.items.map((item: any) => {
      let value = item.totalNet;
      if (activeMetric === 'percent') value = item.sharePercent;
      else if (activeMetric === 'avg') value = item.avgNetPerHead;
      else if (activeMetric === 'headcount') value = item.headcount;

      return {
        id: item.id,
        name: item.name.length > 20 ? item.name.substring(0, 18) + '...' : item.name,
        fullName: item.name,
        value: value,
        totalNet: item.totalNet,
        totalGross: item.totalGross,
        totalDeductions: item.totalDeductions,
        headcount: item.headcount,
        sharePercent: item.sharePercent,
        avgNetPerHead: item.avgNetPerHead,
        baseSalary: item.baseSalary,
        otShift: item.otShift,
        specialAllowance: item.specialAllowance
      };
    });
  }, [dimensionData, activeMetric]);

  const filteredDrilldownEmployees = useMemo(() => {
    if (!drilldownSearch) return drilldownEmployees;
    const s = drilldownSearch.toLowerCase();
    return drilldownEmployees.filter(emp => 
      emp.firstName.toLowerCase().includes(s) ||
      emp.lastName.toLowerCase().includes(s) ||
      emp.employeeCode.toLowerCase().includes(s) ||
      emp.position.toLowerCase().includes(s) ||
      emp.department.toLowerCase().includes(s)
    );
  }, [drilldownEmployees, drilldownSearch]);

  const metrics = summaryData?.metrics;
  const comparison = summaryData?.comparison;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-[#1877f2]" /> แดชบอร์ดวิเคราะห์สำหรับผู้บริหาร
            </h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
              Executive Analytics
            </Badge>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            วิเคราะห์ภาพรวมงบประมาณค่าใช้จ่ายบุคลากร และเจาะลึกข้อมูลหลายมิติ (Multi-Dimensional Drill-Down)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            รีเฟรช
          </Button>

          <Button 
            size="sm" 
            className="bg-[#1877f2] hover:bg-[#166fe5] text-white shadow-sm font-medium"
            onClick={() => router.push('/dashboard/reports')}
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            เปิดศูนย์รวมรายงานฉบับเต็ม
          </Button>
        </div>
      </div>

      {/* Multi-Dimensional Control Bar */}
      <Card className="border shadow-xs bg-white">
        <CardContent className="p-4 space-y-3.5">
          {/* Row 1: Time Dimension Pills */}
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
                        ? 'bg-white text-[#1877f2] shadow-xs' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Controls */}
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

              {periodType === 'quarterly' && (
                <>
                  <select 
                    className="h-8 text-xs border rounded-md px-2 bg-white font-medium"
                    value={selectedQuarter}
                    onChange={e => setSelectedQuarter(e.target.value)}
                  >
                    <option value="1">ไตรมาส 1 (ม.ค. - มี.ค.)</option>
                    <option value="2">ไตรมาส 2 (เม.ย. - มิ.ย.)</option>
                    <option value="3">ไตรมาส 3 (ก.ค. - ก.ย.)</option>
                    <option value="4">ไตรมาส 4 (ต.ค. - ธ.ค.)</option>
                  </select>
                  <select 
                    className="h-8 text-xs border rounded-md px-2 bg-white font-medium"
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                  >
                    <option value="2026">พ.ศ. 2569</option>
                    <option value="2025">พ.ศ. 2568</option>
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
                  <option value="2024">ปี พ.ศ. 2567</option>
                </select>
              )}

              {summaryData?.periodLabel && (
                <span className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                  {summaryData.periodLabel}
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Dimension Grouping & Metric Units */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
            {/* Dimension Grouping Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-600" /> มิติการจัดกลุ่ม:
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { id: 'department', label: 'จำแนกตามกลุ่มงาน', icon: Building2 },
                  { id: 'position', label: 'จำแนกตามตำแหน่ง', icon: Briefcase },
                  { id: 'employeeType', label: 'ประเภทการจ้าง', icon: Tag },
                  { id: 'payCategory', label: 'หมวดเงินได้-เงินหัก', icon: DollarSign }
                ].map(d => (
                  <Button
                    key={d.id}
                    variant={activeDimension === d.id ? "default" : "outline"}
                    size="sm"
                    className={`h-8 text-xs font-medium ${
                      activeDimension === d.id 
                        ? 'bg-[#1877f2] text-white hover:bg-[#166fe5]' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveDimension(d.id as any)}
                  >
                    <d.icon className="w-3.5 h-3.5 mr-1" />
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Metric Unit Toggles */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-500">หน่วยวัด:</span>
              <div className="flex bg-gray-100 p-0.5 rounded-md text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveMetric('amount')}
                  className={`px-2.5 py-1 rounded font-semibold transition-all ${activeMetric === 'amount' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-500'}`}
                >
                  บาทรวม (฿)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('percent')}
                  className={`px-2.5 py-1 rounded font-semibold transition-all ${activeMetric === 'percent' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-500'}`}
                >
                  สัดส่วน (%)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('avg')}
                  className={`px-2.5 py-1 rounded font-semibold transition-all ${activeMetric === 'avg' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-500'}`}
                >
                  เฉลี่ย/คน
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('headcount')}
                  className={`px-2.5 py-1 rounded font-semibold transition-all ${activeMetric === 'headcount' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-500'}`}
                >
                  จำนวนคน
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Payout */}
        <Card className="border shadow-xs bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
          <CardContent className="p-4 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">ยอดเบิกจ่ายสุทธิรวม</span>
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 mt-2">
              ฿{metrics ? (metrics.totalNetPayout).toLocaleString() : '0'}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-gray-500">
              <span>เงินได้รวม: ฿{metrics ? metrics.totalGrossIncome.toLocaleString() : '0'}</span>
              {comparison && (
                <span className={`inline-flex items-center font-bold ${comparison.netChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {comparison.netChangePercent >= 0 ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                  {comparison.netChangePercent > 0 ? `+${comparison.netChangePercent}%` : `${comparison.netChangePercent}%`}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Headcount */}
        <Card className="border shadow-xs bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />
          <CardContent className="p-4 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">อัตรากำลังรวมในงวด</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 mt-2">
              {metrics ? metrics.totalHeadcount : 0} <span className="text-sm font-normal text-gray-500">คน</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-gray-500">
              <span>เฉลี่ยสุทธิ/คน:</span>
              <span className="font-bold text-gray-800">฿{metrics ? metrics.avgNetPerHead.toLocaleString() : '0'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Overtime & Shifts */}
        <Card className="border shadow-xs bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <CardContent className="p-4 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">ค่าเวรและล่วงเวลา (OT)</span>
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 mt-2">
              ฿{metrics ? metrics.otShiftTotal.toLocaleString() : '0'}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-gray-500">
              <span>สัดส่วนต่อเงินเดือนหลัก:</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                {metrics ? metrics.otRatioPercent : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Deductions & Taxes */}
        <Card className="border shadow-xs bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-600" />
          <CardContent className="p-4 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">ภาษี & เงินสะสมกองทุน</span>
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 mt-2">
              ฿{metrics ? metrics.totalDeductions.toLocaleString() : '0'}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t text-[11px] text-gray-500">
              <span>ภาษี: ฿{metrics ? metrics.taxTotal.toLocaleString() : '0'}</span>
              <span>สปส: ฿{metrics ? metrics.ssoTotal.toLocaleString() : '0'}</span>
              <span>กบข: ฿{metrics ? metrics.gpfTotal.toLocaleString() : '0'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 spans): Primary Interactive Drill-down Chart */}
        <Card className="lg:col-span-2 border shadow-xs bg-white">
          <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" /> 
                {activeDimension === 'department' && 'ค่าใช้จ่ายแยกตามกลุ่มงาน (คลิกแท่งเพื่อเจาะลึก)'}
                {activeDimension === 'position' && 'ค่าใช้จ่ายแยกตามตำแหน่งวิชาชีพ (คลิกแท่งเพื่อเจาะลึก)'}
                {activeDimension === 'employeeType' && 'ค่าใช้จ่ายแยกตามประเภทการจ้างงาน (คลิกแท่งเพื่อเจาะลึก)'}
                {activeDimension === 'payCategory' && 'สัดส่วนจำแนกตามหมวดเงินได้-เงินหัก'}
              </CardTitle>
              <CardDescription className="text-xs">
                {activeMetric === 'amount' && 'แสดงยอดเงินสุทธิ (บาท)'}
                {activeMetric === 'percent' && 'แสดงสัดส่วนเปอร์เซ็นต์ (%)'}
                {activeMetric === 'avg' && 'แสดงค่าเฉลี่ยต่อคน (บาท/คน)'}
                {activeMetric === 'headcount' && 'แสดงจำนวนบุคลากร (คน)'}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[11px] bg-gray-50">
              {chartData.length} รายการ
            </Badge>
          </CardHeader>
          <CardContent className="p-4">
            {chartData.length === 0 ? (
              <div className="py-24 text-center text-gray-400 text-sm">ไม่พบข้อมูลสำหรับเงื่อนไขนี้</div>
            ) : (
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={chartData} 
                    margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload.length > 0) {
                        handleDrilldown(e.activePayload[0].payload);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      angle={-35} 
                      textAnchor="end" 
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      interval={0}
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickFormatter={(v) => activeMetric === 'percent' ? `${v}%` : v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                    />
                    <Tooltip 
                      formatter={(val: any, name: any, item: any) => {
                        const p = item.payload;
                        return [
                          activeMetric === 'percent' ? `${val}% (฿${p.totalNet.toLocaleString()})` : `฿${Number(val).toLocaleString()}`,
                          `ยอดจ่าย (${p.headcount} คน)`
                        ];
                      }}
                      labelFormatter={(label, payload: any) => payload?.[0]?.payload?.fullName || label}
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[4, 4, 0, 0]}
                      className="cursor-pointer transition-opacity hover:opacity-85"
                    >
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column (1 span): Donut Composition Chart */}
        <Card className="border shadow-xs bg-white">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-600" /> สัดส่วน % โครงสร้างงบประมาณ
            </CardTitle>
            <CardDescription className="text-xs">Top 6 หมวดที่มีสัดส่วนสูงสุด</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {chartData.length === 0 ? (
              <div className="py-24 text-center text-gray-400 text-sm">ไม่มีข้อมูล</div>
            ) : (
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.slice(0, 6)}
                      dataKey="totalNet"
                      nameKey="fullName"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {chartData.slice(0, 6).map((entry: any, index: number) => (
                        <Cell key={`cell-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [`฿${Number(val).toLocaleString()}`, 'ยอดจ่ายสุทธิ']}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top items legend */}
            <div className="mt-2 space-y-1.5 border-t pt-2 max-h-[140px] overflow-y-auto">
              {chartData.slice(0, 5).map((item: any, idx: number) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between text-xs p-1 rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleDrilldown(item)}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="truncate font-medium text-gray-700">{item.fullName}</span>
                  </div>
                  <div className="font-bold text-gray-900 whitespace-nowrap">
                    {item.sharePercent}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: 12-Month Trend Timeline Chart */}
      {trendData.length > 0 && (
        <Card className="border shadow-xs bg-white">
          <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> แนวโน้มค่าใช้จ่ายบุคลากรย้อนหลัง (12-Month Timeline Trend)
              </CardTitle>
              <CardDescription className="text-xs">
                เปรียบเทียบแนวโน้มเงินเดือนหลัก, ค่าเวร/OT และเงินเพิ่มพิเศษในแต่ละเดือน
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1877f2" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#1877f2" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${(v/1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(val: any, name: any) => [
                      `฿${Number(val).toLocaleString()}`, 
                      name === 'net' ? 'จ่ายสุทธิ' : name === 'baseSalary' ? 'เงินเดือนหลัก' : name === 'otShift' ? 'ค่าเวร/OT' : name
                    ]}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullLabel || label}
                    contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend 
                    formatter={(v) => v === 'net' ? 'ยอดจ่ายสุทธิ' : v === 'baseSalary' ? 'เงินเดือนหลัก' : v === 'otShift' ? 'ค่าเวร/OT' : v}
                    wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                  />
                  <Area type="monotone" dataKey="net" stroke="#1877f2" strokeWidth={2} fillOpacity={1} fill="url(#colorNet)" />
                  <Area type="monotone" dataKey="baseSalary" stroke="#10b981" strokeWidth={1.5} fill="none" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="otShift" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#colorOt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drill-Down Details Modal */}
      <Dialog open={drilldownOpen} onOpenChange={setDrilldownOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-gray-50/80">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <span>ภาพรวม</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-blue-600">
                {activeDimension === 'department' ? 'กลุ่มงาน' : activeDimension === 'position' ? 'ตำแหน่ง' : 'ประเภทพนักงาน'}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-bold text-gray-900">{drilldownTitle}</span>
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
              <span>รายละเอียดพนักงาน: {drilldownTitle}</span>
              {drilldownSummary && (
                <Badge variant="outline" className="text-sm bg-blue-50 text-blue-800 border-blue-200">
                  รวม ฿{drilldownSummary.totalNet.toLocaleString()} ({drilldownEmployees.length} คน)
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="p-3 border-b bg-white flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
              <Input 
                placeholder="ค้นหารหัส/ชื่อพนักงาน..."
                className="pl-8 h-8 text-xs bg-gray-50"
                value={drilldownSearch}
                onChange={e => setDrilldownSearch(e.target.value)}
              />
            </div>
            <span className="text-xs text-gray-500">
              แสดง {filteredDrilldownEmployees.length} จาก {drilldownEmployees.length} คน
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-0">
            {drilldownLoading ? (
              <div className="py-20 text-center text-gray-500">กำลังโหลดรายละเอียด...</div>
            ) : filteredDrilldownEmployees.length === 0 ? (
              <div className="py-20 text-center text-gray-400">ไม่พบรายชื่อพนักงาน</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 text-xs">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>รหัส</TableHead>
                    <TableHead>ชื่อ - นามสกุล</TableHead>
                    <TableHead>กลุ่มงาน / ตำแหน่ง</TableHead>
                    <TableHead className="text-right">เงินได้รวม</TableHead>
                    <TableHead className="text-right">เงินหักรวม</TableHead>
                    <TableHead className="text-right">รับสุทธิ (Net)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrilldownEmployees.map((emp, idx) => (
                    <TableRow key={emp.employeeId || idx} className="hover:bg-blue-50/40 text-xs">
                      <TableCell className="text-center text-gray-400">{idx + 1}</TableCell>
                      <TableCell className="font-semibold text-gray-800">{emp.employeeCode}</TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {emp.firstName} {emp.lastName}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div>{emp.department}</div>
                        <div className="text-[11px] text-gray-400">{emp.position}</div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-gray-700">
                        ฿{emp.grossIncome.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-rose-600 font-medium">
                        -฿{emp.totalDeductions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-bold text-blue-700">
                        ฿{emp.netAmount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <DialogFooter className="p-3 border-t bg-gray-50 flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => router.push('/dashboard/reports')}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> ดูในศูนย์รวมรายงาน
            </Button>
            <Button size="sm" onClick={() => setDrilldownOpen(false)} className="bg-gray-800 text-white">
              ปิดหน้าต่าง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
