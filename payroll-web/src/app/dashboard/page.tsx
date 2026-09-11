"use client";
import { API_URL } from "@/lib/config";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  Clock, 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  BarChart3, 
  FileSpreadsheet, 
  Calculator, 
  FolderKanban, 
  Briefcase, 
  Settings, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Layers,
  PieChart as PieIcon,
  RefreshCw,
  Building2,
  CreditCard,
  ChevronRight
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { toast } from "sonner";

const COLORS = ['#1877f2', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#64748b'];

export default function DashboardHome() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dashboard Data States
  const [summaryData, setSummaryData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [deptData, setDeptData] = useState<any[]>([]);
  const [recentPayrolls, setRecentPayrolls] = useState<any[]>([]);
  const [employeeStats, setEmployeeStats] = useState<any>({ total: 0, active: 0, resigned: 0 });
  const [myLatestSlip, setMyLatestSlip] = useState<any>(null);

  const currentDateThai = useMemo(() => {
    return new Date().toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          setUser(decoded);
        } catch (e) {}
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [sumRes, trendRes, deptRes, payrollsRes, empsRes, mySlipRes] = await Promise.allSettled([
        axios.get(`${API_URL}/reports/executive/summary`, { params: { periodType: 'latest' }, headers }),
        axios.get(`${API_URL}/reports/executive/trend`, { headers }),
        axios.get(`${API_URL}/reports/executive/by-dimension`, { params: { dimension: 'department' }, headers }),
        axios.get(`${API_URL}/payroll`, { headers }),
        axios.get(`${API_URL}/employees`, { headers }),
        axios.get(`${API_URL}/tax-reports/my-payslips`, { headers })
      ]);

      if (sumRes.status === 'fulfilled') setSummaryData(sumRes.value.data);
      if (trendRes.status === 'fulfilled') setTrendData(trendRes.value.data?.dataPoints || []);
      if (deptRes.status === 'fulfilled') setDeptData(deptRes.value.data?.items || []);
      if (payrollsRes.status === 'fulfilled') setRecentPayrolls((payrollsRes.value.data || []).slice(0, 5));
      
      if (empsRes.status === 'fulfilled') {
        const emps = empsRes.value.data || [];
        const active = emps.filter((e: any) => e.status === 'ACTIVE' || !e.status).length;
        const resigned = emps.filter((e: any) => e.status === 'RESIGNED').length;
        setEmployeeStats({ total: emps.length, active, resigned });
      }

      if (mySlipRes.status === 'fulfilled' && mySlipRes.value.data?.currentPayslip) {
        setMyLatestSlip(mySlipRes.value.data.currentPayslip);
      }
    } catch (e) {
      console.error(e);
      toast.error("ดึงข้อมูลแดชบอร์ดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const metrics = summaryData?.metrics;
  const comparison = summaryData?.comparison;

  const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Welcome & Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-xs backdrop-blur-md px-2.5 py-0.5">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-yellow-300" />
                โรงพยาบาลสามโคก (Samkok Hospital)
              </Badge>
              <span className="text-xs text-blue-100 hidden sm:inline">• {currentDateThai}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              สวัสดี, {user?.username || 'บุคลากร'}
            </h1>
            <p className="text-sm text-blue-100 max-w-xl">
              ระบบบริหารจัดการบัญชีเงินเดือนและค่าตอบแทนบุคลากรทางการแพทย์แบบครบวงจร
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="bg-white text-blue-800 hover:bg-blue-50 font-bold shadow-sm cursor-pointer"
              onClick={() => router.push('/dashboard/my-payslips')}
            >
              <FileText className="w-4 h-4 mr-1.5 text-emerald-600" />
              สลิปของฉัน
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md cursor-pointer"
              onClick={() => router.push('/dashboard/analytics')}
            >
              <BarChart3 className="w-4 h-4 mr-1.5" />
              แดชบอร์ดผู้บริหาร
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md cursor-pointer"
              onClick={() => router.push('/dashboard/payroll')}
            >
              <Calculator className="w-4 h-4 mr-1.5" />
              ทำเงินเดือน
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Live Dynamic KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(n => (
            <Card key={n} className="border shadow-xs bg-white">
              <CardContent className="p-5 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-7 bg-gray-200 rounded w-36"></div>
                <div className="h-3 bg-gray-100 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Latest Net Payroll */}
          <Card className="border shadow-xs bg-white relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">ยอดจ่ายสุทธิ (งวดล่าสุด)</span>
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <DollarSign className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900 mt-2">
                ฿{metrics ? metrics.totalNetPayout.toLocaleString() : '0'}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-gray-500">
                <span className="truncate">{summaryData?.periodLabel || 'งวดล่าสุด'}</span>
                {comparison && (
                  <span className={`inline-flex items-center font-bold ${comparison.netChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {comparison.netChangePercent >= 0 ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                    {comparison.netChangePercent > 0 ? `+${comparison.netChangePercent}%` : `${comparison.netChangePercent}%`}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Total Active Headcount */}
          <Card className="border shadow-xs bg-white relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">อัตรากำลังบุคลากร</span>
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Users className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900 mt-2">
                {employeeStats.active} <span className="text-sm font-normal text-gray-500">คน</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-gray-500">
                <span>ทั้งหมด: {employeeStats.total} คน</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  พร้อมปฏิบัติงาน
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: OT & Shifts */}
          <Card className="border shadow-xs bg-white relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">ค่าเวร & ล่วงเวลา (OT)</span>
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900 mt-2">
                ฿{metrics ? metrics.otShiftTotal.toLocaleString() : '0'}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-gray-500">
                <span>สัดส่วนต่องบหลัก:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  {metrics ? metrics.otRatioPercent : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Taxes & Deductions */}
          <Card className="border shadow-xs bg-white relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1 bg-purple-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">ภาษี & กองทุนนำส่งรัฐ</span>
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <Percent className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900 mt-2">
                ฿{metrics ? metrics.totalDeductions.toLocaleString() : '0'}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t text-[11px] text-gray-500">
                <span>ภาษี: ฿{metrics ? metrics.taxTotal.toLocaleString() : '0'}</span>
                <span>สปส: ฿{metrics ? metrics.ssoTotal.toLocaleString() : '0'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. Middle Section: Charts & Operational Status (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): 12-Month Payroll Trend & Recent Cycles */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trend Chart Card */}
          <Card className="border shadow-xs bg-white">
            <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  แนวโน้มค่าใช้จ่ายเงินเดือน 12 เดือนล่าสุด
                </CardTitle>
                <CardDescription className="text-xs">
                  เปรียบเทียบยอดจ่ายสุทธิรวม (Net Payout) และค่าตอบแทนเวร/OT
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer"
                onClick={() => router.push('/dashboard/analytics')}
              >
                ดูบทวิเคราะห์เต็ม <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {trendData.length === 0 ? (
                <div className="py-20 text-center text-gray-400 text-xs">ยังไม่มีข้อมูลแนวโน้มงวดเงินเดือน</div>
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorNetHome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1877f2" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#1877f2" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOtHome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                      />
                      <Tooltip 
                        formatter={(val: any, name: any) => [
                          `฿${Number(val).toLocaleString()}`, 
                          name === 'net' ? 'จ่ายสุทธิ' : name === 'otShift' ? 'ค่าเวร/OT' : name
                        ]}
                        labelFormatter={(label, p) => p?.[0]?.payload?.fullLabel || label}
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="net" stroke="#1877f2" strokeWidth={2} fillOpacity={1} fill="url(#colorNetHome)" />
                      <Area type="monotone" dataKey="otShift" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#colorOtHome)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payroll Records Table */}
          <Card className="border shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  รอบการจ่ายเงินเดือนล่าสุด (Payroll History)
                </CardTitle>
                <CardDescription className="text-xs">รายการงวดเงินเดือนและการประมวลผลล่าสุดในระบบ</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 cursor-pointer"
                onClick={() => router.push('/dashboard/payroll')}
              >
                จัดการทั้งหมด
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {recentPayrolls.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">ยังไม่มีรายการงวดเงินเดือน</div>
                ) : (
                  recentPayrolls.map((rec: any) => (
                    <div 
                      key={rec.id} 
                      className="p-3.5 hover:bg-gray-50 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/payroll/${rec.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {rec.month}/{String(rec.year + 543).slice(-2)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-xs">
                            เดือน {monthNames[rec.month - 1]} พ.ศ. {rec.year + 543} ({rec.roundName || `งวดที่ ${rec.round}`})
                          </h4>
                          <p className="text-[11px] text-gray-400">
                            {rec.payPeriodStart ? `ช่วง ${new Date(rec.payPeriodStart).toLocaleDateString('th-TH')} - ${new Date(rec.payPeriodEnd).toLocaleDateString('th-TH')}` : 'รอบการจ่ายประจำเดือน'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className={`text-[11px] ${
                            rec.status === 'APPROVED' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {rec.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'ฉบับร่าง'}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Department Composition & My Quick Payslip & Schedules */}
        <div className="space-y-6">
          {/* Department Breakdown Donut */}
          <Card className="border shadow-xs bg-white">
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-600" />
                สัดส่วนงบประมาณตามกลุ่มงาน
              </CardTitle>
              <CardDescription className="text-xs">Top 5 กลุ่มงานที่มีสัดส่วนค่าใช้จ่ายสูงสุด</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {deptData.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">ไม่มีข้อมูลกลุ่มงาน</div>
              ) : (
                <>
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deptData.slice(0, 5)}
                          dataKey="totalNet"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={2}
                        >
                          {deptData.slice(0, 5).map((entry: any, index: number) => (
                            <Cell key={`cell-home-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(val: any) => [`฿${Number(val).toLocaleString()}`, 'จ่ายสุทธิ']}
                          contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 border-t pt-2 max-h-[130px] overflow-y-auto text-xs">
                    {deptData.slice(0, 5).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-1 rounded hover:bg-gray-50">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="truncate font-medium text-gray-700">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900 whitespace-nowrap">{item.sharePercent}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* My Quick Payslip Snapshot */}
          {myLatestSlip && (
            <Card className="border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white shadow-xs">
              <CardHeader className="p-4 pb-2 border-b border-emerald-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-700" /> สลิปเงินเดือนของคุณ
                </CardTitle>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                  งวดล่าสุด
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div>
                  <span className="text-[11px] text-gray-500">ประจำงวด {myLatestSlip.monthName} {myLatestSlip.thaiYear}</span>
                  <div className="text-xl font-black text-emerald-900 mt-0.5">
                    ฿{myLatestSlip.netPayout.toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2 rounded border border-emerald-100">
                  <div>
                    <span className="text-gray-400 block">เงินได้รวม:</span>
                    <span className="font-bold text-gray-800">฿{myLatestSlip.grossIncome.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">เงินหักรวม:</span>
                    <span className="font-bold text-rose-600">-฿{myLatestSlip.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs cursor-pointer"
                  onClick={() => router.push('/dashboard/my-payslips')}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  เปิดดูสลิป & พิมพ์ใบ 50 ทวิ
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Hub Links */}
          <Card className="border shadow-xs bg-white">
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                เมนูลัดการจัดการ (Quick Hub)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 grid grid-cols-2 gap-2">
              {[
                { label: 'จัดการพนักงาน', href: '/dashboard/employees', icon: Users, color: 'text-blue-600 bg-blue-50' },
                { label: 'ศูนย์รวมรายงาน', href: '/dashboard/reports', icon: FileSpreadsheet, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'กลุ่มงาน/แผนก', href: '/dashboard/departments', icon: FolderKanban, color: 'text-amber-600 bg-amber-50' },
                { label: 'ตั้งค่ารายรับ-จ่าย', href: '/dashboard/pay-items', icon: Settings, color: 'text-purple-600 bg-purple-50' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className="p-2.5 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-left transition-all cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-gray-800">{item.label}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
