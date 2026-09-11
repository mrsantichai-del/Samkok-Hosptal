"use client";
export const dynamic = 'force-dynamic';
import { API_URL } from "@/lib/config";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calculator, 
  Settings, 
  FolderKanban, 
  Briefcase, 
  BarChart3, 
  FileSpreadsheet, 
  FileText,
  ChevronRight,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowUpRight,
  ShieldAlert
} from "lucide-react";

interface MenuItem {
  title: string;
  subTitle: string;
  desc: string;
  href: string;
  icon: any;
  category: string;
  color: {
    bg: string;
    text: string;
    border: string;
    hoverBorder: string;
    badge: string;
  };
  roles: string[]; // 'ALL', 'Admin', 'HR', 'Executive', 'Employee'
}

export default function DashboardHome() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);

  const currentDateThai = useMemo(() => {
    return new Date().toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser(decoded);
      } catch (e) {}

      // Fetch employee profile name if available
      axios.get(`${API_URL}/tax-reports/my-payslips`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.data?.employee) {
          setEmployeeProfile(res.data.employee);
        }
      }).catch(() => {});
    }
  }, []);

  // Comprehensive Role Detection
  const userRoles: string[] = useMemo(() => {
    if (!user?.roles) return ['Employee'];
    return Array.isArray(user.roles) ? user.roles : [user.roles];
  }, [user]);

  // System Administrator has 100% full access to everything without needing to be an employee
  const isAdmin = useMemo(() => {
    return userRoles.some(r => {
      const s = String(r || '').toLowerCase();
      return s.includes('admin') || s.includes('administrator') || s.includes('ผู้ดูแลระบบ');
    });
  }, [userRoles]);

  const isHR = useMemo(() => {
    if (isAdmin) return true;
    return userRoles.some(r => {
      const s = String(r || '').toLowerCase();
      return s.includes('hr') || s.includes('บุคคล') || s.includes('การเงิน');
    });
  }, [userRoles, isAdmin]);

  const isExecutive = useMemo(() => {
    if (isAdmin) return true;
    return userRoles.some(r => {
      const s = String(r || '').toLowerCase();
      return s.includes('exec') || s.includes('ผู้บริหาร') || s.includes('director');
    });
  }, [userRoles, isAdmin]);

  // All Menu Modules
  const allMenuItems: MenuItem[] = [
    // หมวด 1: บริการส่วนบุคคล
    {
      title: "สลิปของฉัน & หนังสือรับรอง 50 ทวิ",
      subTitle: "My Payslips & 50 Tawi",
      desc: "เรียกดูสลิปเงินเดือนย้อนหลังทุกงวด ตรวจสอบรายการเงินได้-เงินหัก และสั่งพิมพ์หนังสือรับรองภาษี 50 ทวิ ของตนเอง",
      href: "/dashboard/my-payslips",
      icon: FileText,
      category: "บริการข้อมูลบุคลากรส่วนบุคคล",
      color: {
        bg: "bg-emerald-50/70",
        text: "text-emerald-700",
        border: "border-emerald-200",
        hoverBorder: "hover:border-emerald-400 hover:shadow-emerald-50",
        badge: "bg-emerald-100 text-emerald-800"
      },
      roles: ['ALL', 'Employee', 'HR', 'Admin', 'Executive']
    },

    // หมวด 2: การวิเคราะห์และรายงาน
    {
      title: "แดชบอร์ดผู้บริหาร (Analytics)",
      subTitle: "Executive Analytics & Macro Trends",
      desc: "วิเคราะห์ภาพรวมงบประมาณค่าใช้จ่าย สัดส่วนค่าเวร/OT แนวโน้ม 12 เดือน และเจาะลึกข้อมูลบุคลากรหลายมิติ",
      href: "/dashboard/analytics",
      icon: BarChart3,
      category: "การวิเคราะห์และรายงานผู้บริหาร",
      color: {
        bg: "bg-blue-50/70",
        text: "text-blue-700",
        border: "border-blue-200",
        hoverBorder: "hover:border-blue-400 hover:shadow-blue-50",
        badge: "bg-blue-100 text-blue-800"
      },
      roles: ['Admin', 'Executive', 'HR']
    },
    {
      title: "ศูนย์รวมรายงาน (Reports)",
      subTitle: "Official Reports & Excel Export",
      desc: "ตารางรายงานสรุปค่าใช้จ่ายทางการ จำแนกตามกลุ่มงาน/ประเภทการจ้าง ระบบคลี่ดูรายชื่อย่อย และส่งออก Excel",
      href: "/dashboard/reports",
      icon: FileSpreadsheet,
      category: "การวิเคราะห์และรายงานผู้บริหาร",
      color: {
        bg: "bg-teal-50/70",
        text: "text-teal-700",
        border: "border-teal-200",
        hoverBorder: "hover:border-teal-400 hover:shadow-teal-50",
        badge: "bg-teal-100 text-teal-800"
      },
      roles: ['Admin', 'Executive', 'HR']
    },

    // หมวด 3: การประมวลผลและทะเบียนประวัติ
    {
      title: "ประมวลผลเงินเดือน (Payroll)",
      subTitle: "Payroll Calculation & Approval",
      desc: "สร้างงวดเงินเดือนใหม่ คำนวณรายการเงินได้ เงินหัก ภาษี ประกันสังคม กบข. ตรวจสอบความถูกต้อง และส่งขออนุมัติ",
      href: "/dashboard/payroll",
      icon: Calculator,
      category: "ระบบงานบุคคลและการเงิน",
      color: {
        bg: "bg-indigo-50/70",
        text: "text-indigo-700",
        border: "border-indigo-200",
        hoverBorder: "hover:border-indigo-400 hover:shadow-indigo-50",
        badge: "bg-indigo-100 text-indigo-800"
      },
      roles: ['Admin', 'HR']
    },
    {
      title: "ทะเบียนประวัติพนักงาน (Employees)",
      subTitle: "Employee Master Directory",
      desc: "จัดการข้อมูลประวัติบุคลากร บันทึกวันเริ่มงาน-ลาออก สังกัดกลุ่มงาน ตำแหน่ง อัตราเงินเดือน และผูกบัญชีผู้ใช้",
      href: "/dashboard/employees",
      icon: Users,
      category: "ระบบงานบุคคลและการเงิน",
      color: {
        bg: "bg-purple-50/70",
        text: "text-purple-700",
        border: "border-purple-200",
        hoverBorder: "hover:border-purple-400 hover:shadow-purple-50",
        badge: "bg-purple-100 text-purple-800"
      },
      roles: ['Admin', 'HR']
    },
    {
      title: "จัดการบัญชีผู้ใช้งาน (Users)",
      subTitle: "User Accounts & Role Permissions",
      desc: "บริหารจัดการบัญชีผู้ใช้งานระบบ รหัสผ่าน กำหนดบทบาท และสิทธิ์การเข้าถึงข้อมูลของแต่ละฝ่าย",
      href: "/dashboard/users",
      icon: ShieldCheck,
      category: "ระบบงานบุคคลและการเงิน",
      color: {
        bg: "bg-cyan-50/70",
        text: "text-cyan-700",
        border: "border-cyan-200",
        hoverBorder: "hover:border-cyan-400 hover:shadow-cyan-50",
        badge: "bg-cyan-100 text-cyan-800"
      },
      roles: ['Admin']
    },

    // หมวด 4: โครงสร้างองค์กรและตั้งค่า
    {
      title: "กลุ่มงานและแผนก (Departments)",
      subTitle: "Hospital Organization Structure",
      desc: "กำหนดโครงสร้างสายงาน กลุ่มงานทางการแพทย์ และฝ่ายสนับสนุนต่าง ๆ ภายในโรงพยาบาล",
      href: "/dashboard/departments",
      icon: FolderKanban,
      category: "โครงสร้างองค์กรและการตั้งค่าระบบ",
      color: {
        bg: "bg-amber-50/70",
        text: "text-amber-700",
        border: "border-amber-200",
        hoverBorder: "hover:border-amber-400 hover:shadow-amber-50",
        badge: "bg-amber-100 text-amber-800"
      },
      roles: ['Admin', 'HR']
    },
    {
      title: "ประเภทพนักงาน (Employee Types)",
      subTitle: "Employment Classifications",
      desc: "กำหนดประเภทการจ้างงาน เช่น ข้าราชการ, ลูกจ้างประจำ, พนักงานกระทรวงสาธารณสุข, ลูกจ้างชั่วคราว",
      href: "/dashboard/employee-types",
      icon: Building2,
      category: "โครงสร้างองค์กรและการตั้งค่าระบบ",
      color: {
        bg: "bg-rose-50/70",
        text: "text-rose-700",
        border: "border-rose-200",
        hoverBorder: "hover:border-rose-400 hover:shadow-rose-50",
        badge: "bg-rose-100 text-rose-800"
      },
      roles: ['Admin', 'HR']
    },
    {
      title: "ตำแหน่งและสายวิชาชีพ (Positions)",
      subTitle: "Job Positions & Professions",
      desc: "จัดการทำเนียบตำแหน่งงาน สายวิชาชีพแพทย์ พยาบาล เภสัชกร และบุคลากรทางการแพทย์ทุกสายงาน",
      href: "/dashboard/positions",
      icon: Briefcase,
      category: "โครงสร้างองค์กรและการตั้งค่าระบบ",
      color: {
        bg: "bg-orange-50/70",
        text: "text-orange-700",
        border: "border-orange-200",
        hoverBorder: "hover:border-orange-400 hover:shadow-orange-50",
        badge: "bg-orange-100 text-orange-800"
      },
      roles: ['Admin', 'HR']
    },
    {
      title: "ตั้งค่ารายรับ-รายจ่าย (Pay Items)",
      subTitle: "Earnings, Deductions & Formula Settings",
      desc: "กำหนดประเภทเงินได้ รายการหัก ภาษี กองทุน สปส. กบข. และตั้งค่าสูตรคำนวณอัตโนมัติ",
      href: "/dashboard/pay-items",
      icon: Settings,
      category: "โครงสร้างองค์กรและการตั้งค่าระบบ",
      color: {
        bg: "bg-violet-50/70",
        text: "text-violet-700",
        border: "border-violet-200",
        hoverBorder: "hover:border-violet-400 hover:shadow-violet-50",
        badge: "bg-violet-100 text-violet-800"
      },
      roles: ['Admin', 'HR']
    },
    {
      title: "ตั้งค่าระบบ (Settings)",
      subTitle: "System General Configuration",
      desc: "ข้อมูลองค์กร ตราสัญลักษณ์โรงพยาบาลสามโคก และการกำหนดค่าพื้นฐานของระบบสารสนเทศ",
      href: "/dashboard/settings",
      icon: Settings,
      category: "โครงสร้างองค์กรและการตั้งค่าระบบ",
      color: {
        bg: "bg-slate-50/70",
        text: "text-slate-700",
        border: "border-slate-200",
        hoverBorder: "hover:border-slate-400 hover:shadow-slate-50",
        badge: "bg-slate-100 text-slate-800"
      },
      roles: ['Admin']
    }
  ];

  // Filter menu items: System Administrator sees 100% of all items
  const visibleMenuItems = useMemo(() => {
    if (isAdmin) return allMenuItems;
    return allMenuItems.filter(item => {
      if (item.roles.includes('ALL')) return true;
      if (isHR && item.roles.includes('HR')) return true;
      if (isExecutive && item.roles.includes('Executive')) return true;
      return item.roles.some(r => userRoles.includes(r));
    });
  }, [userRoles, isAdmin, isHR, isExecutive]);

  // Group by category
  const categories = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of visibleMenuItems) {
      if (!map.has(item.category)) {
        map.set(item.category, []);
      }
      map.get(item.category)!.push(item);
    }
    return Array.from(map.entries()).map(([title, items]) => ({ title, items }));
  }, [visibleMenuItems]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Hospital Greeting Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img 
            src="/logo.jpg" 
            alt="Hospital Logo" 
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-emerald-100 shadow-xs" 
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                โรงพยาบาลสามโคก (Samkok Hospital)
              </h1>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-semibold">
                ระบบการเงินและเงินเดือน
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2 flex-wrap">
              <span>สวัสดีคุณ <b>{employeeProfile?.fullName || user?.username || 'ผู้ดูแลระบบ'}</b></span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">
                {employeeProfile?.position 
                  ? `${employeeProfile.position} (${employeeProfile.department})` 
                  : isAdmin ? 'ผู้ดูแลระบบสูงสุด (System Administrator)' : user?.roles?.[0] || 'ผู้ใช้งานระบบ'}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-blue-600 font-medium">{currentDateThai}</span>
            </p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Badge className="bg-emerald-600 text-white border-none text-xs px-3 py-1 font-bold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              สิทธิ์: ผู้ดูแลระบบสูงสุด (System Administrator)
            </Badge>
          ) : (
            <Badge className="bg-blue-50 text-blue-800 border border-blue-200 text-xs px-3 py-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600" />
              สิทธิ์การใช้งาน: {userRoles.join(', ')}
            </Badge>
          )}
        </div>
      </div>

      {/* 2. Menu Launcher Cards */}
      <div className="space-y-6">
        {categories.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="w-2 h-4 rounded-full bg-[#1877f2]" />
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                {cat.title}
              </h2>
              <span className="text-xs text-gray-400">({cat.items.length} โมดูล)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.items.map((item, idx) => (
                <Card
                  key={idx}
                  onClick={() => router.push(item.href)}
                  className={`border shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer bg-white group flex flex-col justify-between ${item.color.hoverBorder}`}
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                    {/* Top: Icon & Title */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color.bg} ${item.color.text} border ${item.color.border} group-hover:scale-105 transition-transform shadow-xs`}>
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#1877f2] group-hover:text-white transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-base text-gray-900 group-hover:text-[#1877f2] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                          {item.subTitle}
                        </p>
                      </div>

                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                        {item.desc}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500 group-hover:text-[#1877f2] transition-colors">
                      <span>เข้าสู่ระบบงาน</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
