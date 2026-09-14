"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { 
  Home,
  ReceiptText,
  BarChart3,
  FileSpreadsheet,
  Calculator,
  Contact,
  FolderKanban,
  Building2,
  Briefcase,
  SlidersHorizontal,
  UserCog,
  ShieldAlert,
  Settings2,
  ScrollText,
  LogOut,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NotificationBell from "@/components/NotificationBell";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles: string[];
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Close mobile drawer upon navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

  // 5 Structured Menu Groups based on Roles & Workflow Context
  const navGroups: NavGroup[] = useMemo(() => [
    {
      groupName: "หน้าหลักและบริการตนเอง",
      items: [
        { name: "หน้าหลัก", href: "/home", icon: Home, roles: ['ALL'] },
        { name: "สลิปของฉัน & 50 ทวิ", href: "/my-payslips", icon: ReceiptText, roles: ['ALL'] },
      ]
    },
    {
      groupName: "การวิเคราะห์และรายงาน",
      items: [
        { name: "แดชบอร์ดผู้บริหาร", href: "/analytics", icon: BarChart3, roles: ['Admin', 'Executive', 'HR'] },
        { name: "ศูนย์รวมรายงาน", href: "/reports", icon: FileSpreadsheet, roles: ['Admin', 'Executive', 'HR'] },
      ]
    },
    {
      groupName: "ระบบงานบุคคลและการเงิน",
      items: [
        { name: "ประมวลผลเงินเดือน", href: "/payroll", icon: Calculator, roles: ['Admin', 'HR'] },
        { name: "ทะเบียนประวัติพนักงาน", href: "/employees", icon: Contact, roles: ['Admin', 'HR'] },
      ]
    },
    {
      groupName: "โครงสร้างองค์กรและฐานข้อมูล",
      items: [
        { name: "กลุ่มงานและแผนก", href: "/departments", icon: FolderKanban, roles: ['Admin', 'HR'] },
        { name: "ประเภทพนักงาน", href: "/employee-types", icon: Building2, roles: ['Admin', 'HR'] },
        { name: "ตำแหน่งและสายวิชาชีพ", href: "/positions", icon: Briefcase, roles: ['Admin', 'HR'] },
        { name: "ตั้งค่ารายรับ-รายจ่าย", href: "/pay-items", icon: SlidersHorizontal, roles: ['Admin', 'HR'] },
      ]
    },
    {
      groupName: "ผู้ดูแลระบบ (System Admin)",
      items: [
        { name: "จัดการบัญชีผู้ใช้งาน", href: "/users", icon: UserCog, roles: ['Admin'] },
        { name: "กลุ่มผู้ใช้งานและกำหนดสิทธิ์", href: "/roles", icon: ShieldAlert, roles: ['Admin'] },
        { name: "ประวัติการใช้งาน (Audit Logs)", href: "/audit-logs", icon: ScrollText, roles: ['Admin', 'Executive'] },
        { name: "ตั้งค่าระบบ", href: "/settings", icon: Settings2, roles: ['Admin'] },
      ]
    }
  ], []);

  // Filter groups according to current user's role
  const visibleNavGroups = useMemo(() => {
    return navGroups.map(group => {
      const visibleItems = group.items.filter(item => {
        if (isAdmin) return true;
        if (item.roles.includes('ALL')) return true;
        if (isHR && item.roles.includes('HR')) return true;
        if (isExecutive && item.roles.includes('Executive')) return true;
        return item.roles.some(r => userRoles.includes(r));
      });
      return {
        ...group,
        items: visibleItems
      };
    }).filter(group => group.items.length > 0);
  }, [navGroups, userRoles, isAdmin, isHR, isExecutive]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-xs h-14 flex items-center px-3 sm:px-4 justify-between print:hidden">
        <div className="flex items-center gap-3">
          {/* Toggle Sidebar Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-lg hover:bg-gray-100 w-9 h-9 text-gray-700 cursor-pointer"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileMenuOpen(!isMobileMenuOpen);
              } else {
                setIsSidebarCollapsed(!isSidebarCollapsed);
              }
            }}
            title="ซ่อน/แสดง เมนูด้านข้าง"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo & System Brand */}
          <Link href="/home" className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="Samkok Hospital Logo" className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-xs" />
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-gray-900 tracking-tight block leading-tight">ระบบเงินเดือนสามโคก</span>
              <span className="text-[10px] text-gray-500 font-medium block leading-tight">Samkok Hospital Payroll</span>
            </div>
          </Link>
        </div>

        {/* Search Input (Hidden on mobile) */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            type="search" 
            placeholder="ค้นหาเมนู / ฟังก์ชัน..." 
            className="w-60 pl-8 bg-gray-100 border-none rounded-full h-9 focus-visible:ring-1 focus-visible:ring-indigo-500 text-xs"
          />
        </div>

        {/* Right User Info & Actions */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          
          <div className="flex items-center gap-2 ml-1 pl-2 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-gray-900">{user.username}</div>
              <div className="text-[10px] text-emerald-700 font-semibold">{isAdmin ? 'System Administrator' : user.roles?.[0] || 'Employee'}</div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 w-9 h-9 cursor-pointer transition-colors" 
              onClick={handleLogout} 
              title="ออกจากระบบ"
            >
              <LogOut className="h-4 w-4 text-gray-600 hover:text-red-600" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden print:overflow-visible print:block relative">
        {/* ========================================================================= */}
        {/* DESKTOP SIDEBAR (Collapsible w-[270px] <-> w-[72px]) */}
        {/* ========================================================================= */}
        <aside 
          className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out print:hidden overflow-y-auto ${
            isSidebarCollapsed ? "w-[72px]" : "w-[270px]"
          }`}
        >
          <div className="p-2 space-y-4">
            {visibleNavGroups.map((group, gIdx) => (
              <div key={group.groupName || gIdx} className="space-y-1">
                {/* Group Header (Only visible when expanded) */}
                {!isSidebarCollapsed && (
                  <div className="px-3 pt-2.5 pb-1 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {group.groupName}
                  </div>
                )}
                {isSidebarCollapsed && gIdx > 0 && (
                  <div className="border-t border-gray-100 my-1.5 mx-2" />
                )}

                {/* Group Nav Items */}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/home");
                    const Icon = item.icon;
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        title={isSidebarCollapsed ? item.name : undefined}
                      >
                        <div 
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all text-sm cursor-pointer ${
                            isActive 
                              ? "bg-[#1877f2]/10 text-[#1877f2] font-semibold shadow-2xs" 
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          } ${isSidebarCollapsed ? "justify-center px-0 py-2.5" : ""}`}
                        >
                          <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-[#1877f2]" : "text-gray-500"}`} />
                          {!isSidebarCollapsed && (
                            <span className="truncate">{item.name}</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* MOBILE / TABLET DRAWER (Slide-over with Backdrop) */}
        {/* ========================================================================= */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop Overlay */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-out Drawer Panel */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-50 overflow-y-auto">
              {/* Drawer Header */}
              <div className="h-14 px-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full object-cover" />
                  <span className="font-bold text-sm text-gray-900">เมนูระบบ</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg h-8 w-8 text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Drawer Navigation List */}
              <div className="p-3 space-y-4">
                {visibleNavGroups.map((group, gIdx) => (
                  <div key={group.groupName || gIdx} className="space-y-1">
                    <div className="px-3 pt-2 pb-1 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {group.groupName}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/home");
                        const Icon = item.icon;
                        return (
                          <Link 
                            key={item.name} 
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <div 
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                                isActive 
                                  ? "bg-[#1877f2]/10 text-[#1877f2] font-bold" 
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-[#1877f2]" : "text-gray-500"}`} />
                              <span>{item.name}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN PAGE CONTENT */}
        {/* ========================================================================= */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto print:p-0 print:m-0 print:overflow-visible print:w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
