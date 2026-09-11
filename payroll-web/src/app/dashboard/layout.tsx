"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { 
  Users, 
  Calculator, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  Bell,
  Search,
  Menu,
  FolderKanban,
  Briefcase,
  BarChart3,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NotificationBell from "@/components/NotificationBell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      const decoded: any = jwtDecode(token);
      setUser(decoded);
    } catch (e) {
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/");
  };

  const userRoles: string[] = useMemo(() => {
    if (!user?.roles) return ['Employee'];
    return Array.isArray(user.roles) ? user.roles : [user.roles];
  }, [user]);

  // System Administrator has 100% full access to everything
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

  const allNavItems = [
    { name: "แดชบอร์ดหลัก", href: "/dashboard", icon: LayoutDashboard, roles: ['ALL'] },
    { name: "สลิปของฉัน (My Payslips)", href: "/dashboard/my-payslips", icon: FileText, roles: ['ALL'] },
    { name: "แดชบอร์ดผู้บริหาร (Analytics)", href: "/dashboard/analytics", icon: BarChart3, roles: ['Admin', 'Executive', 'HR'] },
    { name: "ศูนย์รวมรายงาน (Reports)", href: "/dashboard/reports", icon: FileSpreadsheet, roles: ['Admin', 'Executive', 'HR'] },
    { name: "ประมวลผลเงินเดือน", href: "/dashboard/payroll", icon: Calculator, roles: ['Admin', 'HR'] },
    { name: "พนักงาน", href: "/dashboard/employees", icon: Users, roles: ['Admin', 'HR'] },
    { name: "ผู้ใช้งาน", href: "/dashboard/users", icon: ShieldCheck, roles: ['Admin'] },
    { name: "กลุ่มงาน", href: "/dashboard/departments", icon: FolderKanban, roles: ['Admin', 'HR'] },
    { name: "ประเภทพนักงาน", href: "/dashboard/employee-types", icon: Building2, roles: ['Admin', 'HR'] },
    { name: "ตำแหน่ง", href: "/dashboard/positions", icon: Briefcase, roles: ['Admin', 'HR'] },
    { name: "ตั้งค่ารายรับ/รายจ่าย", href: "/dashboard/pay-items", icon: Settings, roles: ['Admin', 'HR'] },
    { name: "ตั้งค่าระบบ", href: "/dashboard/settings", icon: Settings, roles: ['Admin'] },
  ];

  // Administrator sees ALL items
  const visibleNavItems = useMemo(() => {
    if (isAdmin) return allNavItems;
    return allNavItems.filter(item => {
      if (item.roles.includes('ALL')) return true;
      if (isHR && item.roles.includes('HR')) return true;
      if (isExecutive && item.roles.includes('Executive')) return true;
      return item.roles.some(r => userRoles.includes(r));
    });
  }, [userRoles, isAdmin, isHR, isExecutive]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm h-14 flex items-center px-4 justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Samkok Hospital Logo" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
          </Link>
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              type="search" 
              placeholder="ค้นหา..." 
              className="w-64 pl-9 bg-[#f0f2f5] border-none rounded-full h-10 focus-visible:ring-0 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] w-10 h-10">
            <Menu className="h-5 w-5 text-black" />
          </Button>
          <NotificationBell />
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-300">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-gray-900">{user.username}</div>
              <div className="text-xs text-emerald-700 font-bold">{isAdmin ? 'System Administrator' : user.roles?.[0] || 'Employee'}</div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] w-10 h-10 cursor-pointer" onClick={handleLogout} title="ออกจากระบบ">
              <LogOut className="h-5 w-5 text-black" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[280px] hidden lg:flex flex-col p-2 overflow-y-auto print:hidden border-r bg-white/50">
          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                    isActive ? "bg-[#1877f2]/10 text-[#1877f2] font-bold" : "text-gray-700 hover:bg-[#e4e6eb]"
                  }`}>
                    <item.icon className={`h-5 w-5 ${isActive ? "text-[#1877f2]" : "text-gray-500"}`} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
