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
  Building2,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Megaphone,
  PhoneCall,
  Info,
  CalendarCheck,
  FileCheck2,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardHome() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // States
  const [employeeStats, setEmployeeStats] = useState<any>({ total: 0, active: 0, resigned: 0, departmentsCount: 0 });
  const [latestPayroll, setLatestPayroll] = useState<any>(null);
  const [myLatestSlip, setMyLatestSlip] = useState<any>(null);
  const [myEmployeeProfile, setMyEmployeeProfile] = useState<any>(null);

  const currentDateThai = useMemo(() => {
    return new Date().toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const currentMonthName = useMemo(() => {
    const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    return monthNames[new Date().getMonth()];
  }, []);

  const currentYearThai = useMemo(() => {
    return new Date().getFullYear() + 543;
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

      const [payrollsRes, empsRes, deptsRes, mySlipRes] = await Promise.allSettled([
        axios.get(`${API_URL}/payroll`, { headers }),
        axios.get(`${API_URL}/employees`, { headers }),
        axios.get(`${API_URL}/employees/departments`, { headers }),
        axios.get(`${API_URL}/tax-reports/my-payslips`, { headers })
      ]);

      if (payrollsRes.status === 'fulfilled' && payrollsRes.value.data?.length > 0) {
        setLatestPayroll(payrollsRes.value.data[0]);
      }
      
      if (empsRes.status === 'fulfilled') {
        const emps = empsRes.value.data || [];
        const active = emps.filter((e: any) => e.status === 'ACTIVE' || !e.status).length;
        const resigned = emps.filter((e: any) => e.status === 'RESIGNED').length;
        const deptsCount = deptsRes.status === 'fulfilled' ? (deptsRes.value.data?.length || 0) : 0;
        setEmployeeStats({ total: emps.length, active, resigned, departmentsCount: deptsCount });
      }

      if (mySlipRes.status === 'fulfilled') {
        setMyEmployeeProfile(mySlipRes.value.data?.employee || null);
        setMyLatestSlip(mySlipRes.value.data?.currentPayslip || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Hospital Welcome & Identity Header */}
      <div className="bg-white rounded-2xl p-6 border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <img 
            src="/logo.jpg" 
            alt="Hospital Logo" 
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-100 shadow-xs" 
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                โรงพยาบาลสามโคก (Samkok Hospital)
              </h1>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs">
                ระบบการเงินและเงินเดือน
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2 flex-wrap">
              <span>สวัสดีคุณ <b>{myEmployeeProfile?.fullName || user?.username || 'บุคลากร'}</b></span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600">{myEmployeeProfile?.position ? `${myEmployeeProfile.position} (${myEmployeeProfile.department})` : user?.roles?.[0] || 'ผู้ใช้งานระบบ'}</span>
              <span className="text-gray-300">•</span>
              <span className="text-blue-600 font-medium">{currentDateThai}</span>
            </p>
          </div>
        </div>

        {/* Quick Top Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs"
            onClick={() => router.push('/dashboard/my-payslips')}
          >
            <FileText className="w-4 h-4 mr-1.5" />
            เปิดสลิปของฉัน
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-300 font-medium cursor-pointer"
            onClick={() => router.push('/dashboard/my-payslips?tab=50tawi')}
          >
            <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-600" />
            พิมพ์ใบ 50 ทวิ
          </Button>
        </div>
      </div>

      {/* 2. Three Balanced Operational Pillars (บริการบุคลากร & การปฏิบัติงาน) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1: สลิปเงินเดือนส่วนบุคคล (Personal Payslip Service) */}
        <Card className="border border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-white to-white shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2 border-b border-emerald-100/60 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              สลิปเงินเดือนของคุณ (My Payslip)
            </CardTitle>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
              บริการส่วนตัว
            </Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {myLatestSlip ? (
              <>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-500">งวด {myLatestSlip.monthName} {myLatestSlip.thaiYear}</span>
                  <div className="text-xl font-black text-emerald-800">
                    ฿{myLatestSlip.netPayout.toLocaleString()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2 rounded-md border border-emerald-100">
                  <div>
                    <span className="text-gray-400 block">เงินได้รวม:</span>
                    <span className="font-semibold text-gray-800">฿{myLatestSlip.grossIncome.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">เงินหักรวม:</span>
                    <span className="font-semibold text-rose-600">-฿{myLatestSlip.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 border-emerald-200 cursor-pointer font-medium"
                  onClick={() => router.push('/dashboard/my-payslips')}
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  ดูรายละเอียดสลิป & พิมพ์เอกสาร
                </Button>
              </>
            ) : (
              <div className="py-6 text-center text-gray-400 text-xs">
                <FileText className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                <span>ยังไม่มีประวัติสลิปในงวดปัจจุบัน</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pillar 2: สถานะรอบการเงิน & ปฏิทินรอบเดือน (Payroll Schedule & Cycle Status) */}
        <Card className="border border-blue-200 bg-gradient-to-br from-blue-50/40 via-white to-white shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2 border-b border-blue-100/60 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-blue-950 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              รอบเงินเดือน {currentMonthName} {currentYearThai}
            </CardTitle>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">
              สถานะรอบเดือน
            </Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">งวดล่าสุดในระบบ:</span>
              <span className="font-bold text-gray-900">
                {latestPayroll ? `เดือน ${latestPayroll.month}/${latestPayroll.year + 543} (${latestPayroll.roundName || 'งวดปกติ'})` : 'มีนาคม 2569'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">สถานะการอนุมัติ:</span>
              <span className="font-bold text-emerald-700 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {latestPayroll?.status === 'APPROVED' ? 'อนุมัติเรียบร้อย' : 'พร้อมทำรายการ'}
              </span>
            </div>
            <div className="bg-white p-2 rounded-md border border-blue-100 text-[11px] text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>ปิดรับเอกสาร OT / ค่าเวร:</span>
                <span className="font-semibold text-blue-800">วันที่ 20 ของทุกเดือน</span>
              </div>
              <div className="flex justify-between">
                <span>วันเงินเดือนเข้าบัญชี:</span>
                <span className="font-semibold text-blue-800">ทุกสิ้นเดือน</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs text-blue-700 bg-blue-50/60 hover:bg-blue-100 border-blue-200 cursor-pointer font-medium"
              onClick={() => router.push('/dashboard/payroll')}
            >
              <Calculator className="w-3.5 h-3.5 mr-1" />
              เข้าสู่หน้าประมวลผลเงินเดือน
            </Button>
          </CardContent>
        </Card>

        {/* Pillar 3: อัตรากำลัง & ทำเนียบบุคลากร (Hospital Staff Directory) */}
        <Card className="border border-purple-200 bg-gradient-to-br from-purple-50/40 via-white to-white shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2 border-b border-purple-100/60 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-purple-950 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              ทำเนียบบุคลากร (Staff Directory)
            </CardTitle>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px]">
              ฝ่ายบุคคล
            </Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 block">บุคลากรที่พร้อมปฏิบัติงาน:</span>
                <div className="text-xl font-black text-purple-900 mt-0.5">
                  {employeeStats.active || 18} <span className="text-xs font-normal text-gray-500">คน</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 block">กลุ่มงานทั้งหมด:</span>
                <div className="text-lg font-bold text-gray-800 mt-0.5">
                  {employeeStats.departmentsCount || 7} <span className="text-xs font-normal text-gray-500">กลุ่มงาน</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-2 rounded-md border border-purple-100 text-[11px] text-gray-600 flex justify-between">
              <span>สถานะ: ข้าราชการ, ลจ., พกส.</span>
              <span className="font-semibold text-emerald-700">ครบทุกสายวิชาชีพ</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs text-purple-700 bg-purple-50/60 hover:bg-purple-100 border-purple-200 cursor-pointer font-medium"
              onClick={() => router.push('/dashboard/employees')}
            >
              <UserCheck className="w-3.5 h-3.5 mr-1" />
              ค้นหารายชื่อ & จัดการข้อมูลพนักงาน
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 3. Monthly Operational Timeline / Tracker */}
      <Card className="border shadow-xs bg-white">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            วงจรการปฏิบัติงานเงินเดือนประจำเดือน (Monthly Payroll Workflow & Schedule)
          </CardTitle>
          <CardDescription className="text-xs">
            ขั้นตอนและกำหนดการสำคัญในแต่ละรอบเดือน สำหรับเจ้าหน้าที่และบุคลากรโรงพยาบาลสามโคก
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: "1",
                title: "ส่งใบเบิกค่าเวร & OT",
                date: "วันที่ 1 - 20 ของเดือน",
                desc: "หัวหน้างานรวบรวมและส่งยอดปฏิบัติงานนอกเวลา/เวรบ่าย-ดึก",
                status: "active",
                color: "border-blue-500 text-blue-600 bg-blue-50"
              },
              {
                step: "2",
                title: "ตรวจสอบ & ประมวลผล",
                date: "วันที่ 21 - 25 ของเดือน",
                desc: "ฝ่ายการเงินคำนวณเงินเดือน ภาษี สปส. กบข. และตรวจสอบสิทธิ์",
                status: "next",
                color: "border-emerald-500 text-emerald-600 bg-emerald-50"
              },
              {
                step: "3",
                title: "เสนอผู้บริหารอนุมัติ",
                date: "วันที่ 26 - 27 ของเดือน",
                desc: "เสนอรายงานสรุปและตรวจสอบยอดก่อนส่งเข้าบัญชีธนาคาร",
                status: "next",
                color: "border-purple-500 text-purple-600 bg-purple-50"
              },
              {
                step: "4",
                title: "โอนเงิน & ออกสลิป",
                date: "ทุกสิ้นเดือน",
                desc: "เงินเดือนเข้าบัญชี และเปิดให้บุคลากรพิมพ์สลิปและใบ 50 ทวิ",
                status: "finish",
                color: "border-amber-500 text-amber-600 bg-amber-50"
              }
            ].map((st, idx) => (
              <div key={idx} className="border rounded-xl p-3.5 bg-gray-50/50 hover:bg-white transition-colors relative">
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center border ${st.color}`}>
                    {st.step}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded border">
                    {st.date}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-xs">{st.title}</h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. Core Gateway Services (6 เมนูกลางหลักที่ทุกคนใช้งาน) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-blue-600" />
            ศูนย์บริการและระบบงานหลัก (Core Services Hub)
          </h2>
          <span className="text-xs text-gray-500">เลือกบริการที่ต้องการใช้งาน</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "สลิปของฉัน & ใบ 50 ทวิ",
              sub: "My Payslips & 50 Tawi",
              desc: "เรียกดูสลิปเงินเดือนย้อนหลังทุกเดือน และพิมพ์หนังสือรับรองภาษี 50 ทวิ",
              href: "/dashboard/my-payslips",
              icon: FileText,
              color: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-300"
            },
            {
              title: "ประมวลผลเงินเดือน",
              sub: "Payroll Management",
              desc: "สร้างงวดเงินเดือนใหม่ คำนวณภาษี ประกันสังคม กบข. และตรวจสอบยอดเงิน",
              href: "/dashboard/payroll",
              icon: Calculator,
              color: "text-blue-600 bg-blue-50 border-blue-100 hover:border-blue-300"
            },
            {
              title: "ศูนย์รวมรายงานผู้บริหาร",
              sub: "Official Reports Center",
              desc: "ตารางรายงานทางการแยกตามแผนก/ประเภทการจ้าง และส่งออกไฟล์ Excel",
              href: "/dashboard/reports",
              icon: FileSpreadsheet,
              color: "text-amber-600 bg-amber-50 border-amber-100 hover:border-amber-300"
            },
            {
              title: "แดชบอร์ดสถิติ & วิเคราะห์",
              sub: "Executive Analytics",
              desc: "กราฟวิเคราะห์โครงสร้างงบประมาณ สัดส่วนค่าเวร OT และเจาะลึกข้อมูลหลายมิติ",
              href: "/dashboard/analytics",
              icon: BarChart3,
              color: "text-indigo-600 bg-indigo-50 border-indigo-100 hover:border-indigo-300"
            },
            {
              title: "ทะเบียนประวัติบุคลากร",
              sub: "Employee Directory",
              desc: "ข้อมูลพนักงาน สังกัดกลุ่มงาน ตำแหน่ง อัตราเงินเดือน และวันที่เริ่มงาน/ลาออก",
              href: "/dashboard/employees",
              icon: Users,
              color: "text-purple-600 bg-purple-50 border-purple-100 hover:border-purple-300"
            },
            {
              title: "โครงสร้างองค์กร & ค่าตอบแทน",
              sub: "Organization & Pay Items",
              desc: "จัดการกลุ่มงาน ตำแหน่ง และกำหนดสูตรคำนวณรายการได้/รายการหักเงินเดือน",
              href: "/dashboard/departments",
              icon: FolderKanban,
              color: "text-rose-600 bg-rose-50 border-rose-100 hover:border-rose-300"
            }
          ].map((item, idx) => (
            <Card 
              key={idx}
              className={`border shadow-xs hover:shadow-md transition-all cursor-pointer group bg-white ${item.color}`}
              onClick={() => router.push(item.href)}
            >
              <CardContent className="p-4 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform bg-white shadow-xs border">
                  <item.icon className="w-5 h-5 text-current" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {item.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">{item.sub}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 5. Hospital Announcements & Guidelines (ข่าวสารและข้อควรรู้) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* News & Announcements */}
        <Card className="lg:col-span-2 border shadow-xs bg-white">
          <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500" />
              ข่าวประชาสัมพันธ์ & กำหนดการสำคัญ
            </CardTitle>
            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">
              งานบุคคลและการเงิน
            </Badge>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-gray-100">
            {[
              {
                title: "เปิดระบบดาวน์โหลดและพิมพ์หนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ)",
                date: "ประจำปีภาษี 2569",
                tag: "ภาษี & 50 ทวิ",
                desc: "บุคลากรสามารถเข้าสู่ระบบเพื่อสั่งพิมพ์ใบ 50 ทวิ ของตนเองเพื่อใช้ยื่นแบบแสดงรายการภาษีเงินได้บุคคลธรรมดาได้แล้ววันนี้"
              },
              {
                title: "กำหนดส่งหลักฐานการเบิกจ่ายค่าตอบแทนเวรบ่าย-ดึก และค่าล่วงเวลา (OT)",
                date: "ภายในวันที่ 20 ของทุกเดือน",
                tag: "ค่าเวร/OT",
                desc: "กรุณาส่งใบลงเวลาปฏิบัติงานและหลักฐานที่ได้รับอนุมัติจากหัวหน้ากลุ่มงานภายในวันที่กำหนดเพื่อความรวดเร็วในการประมวลผล"
              },
              {
                title: "การปรับปรุงฐานข้อมูลและอัตราการหักเงินสะสมประกันสังคม / กบข.",
                date: "ระเบียบราชการ",
                tag: "สวัสดิการ",
                desc: "ระบบได้ทำการปรับปรุงฐานข้อมูลภาษีและเงินสะสมกองทุนให้เป็นไปตามระเบียบกรมบัญชีกลางและสำนักงานประกันสังคม"
              }
            ].map((n, idx) => (
              <div key={idx} className="p-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-700">
                    {n.tag}
                  </Badge>
                  <span className="text-[11px] text-gray-400 font-medium">{n.date}</span>
                </div>
                <h4 className="font-bold text-xs text-gray-900">{n.title}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{n.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact & Support Box */}
        <Card className="border shadow-xs bg-white">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-blue-600" />
              ติดต่อสอบถาม & ช่วยเหลือ
            </CardTitle>
            <CardDescription className="text-xs">ฝ่ายบริหารงานทั่วไปและสารสนเทศ</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5 text-xs">
            <div className="bg-gray-50 p-3 rounded-lg space-y-2 border">
              <div>
                <span className="text-gray-400 text-[11px] block">งานการเงินและบัญชี:</span>
                <span className="font-bold text-gray-800">โทรภายใน: ต่อ 104, 105</span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">งานทรัพยากรบุคคล (HR):</span>
                <span className="font-bold text-gray-800">โทรภายใน: ต่อ 102</span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">สถานที่ติดต่อ:</span>
                <span className="text-gray-700">อาคารอำนวยการ ชั้น 2 โรงพยาบาลสามโคก</span>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 bg-blue-50/60 p-2.5 rounded-md border border-blue-100 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>หากพบข้อมูลในสลิปเงินเดือนหรือใบ 50 ทวิ ไม่ถูกต้อง สามารถติดต่อประสานงานฝ่ายการเงินได้ในวันและเวลาราชการ</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
