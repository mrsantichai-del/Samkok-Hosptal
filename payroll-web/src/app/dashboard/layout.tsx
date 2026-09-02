"use client";

import { useEffect, useState } from "react";
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
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  if (!user) return null; // Avoid hydration mismatch or flashing

  const navItems = [
    { name: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
    { name: "ผู้ใช้งาน", href: "/dashboard/users", icon: Users },
    { name: "พนักงาน", href: "/dashboard/employees", icon: Users },
    { name: "แผนก", href: "/dashboard/departments", icon: FolderKanban },
    { name: "ประเภทพนักงาน", href: "/dashboard/employee-types", icon: FolderKanban },
    { name: "ตำแหน่ง", href: "/dashboard/positions", icon: Briefcase },
    { name: "ตั้งค่ารายรับ/รายจ่าย", href: "/dashboard/pay-items", icon: Settings },
    { name: "ประมวลผลเงินเดือน", href: "/dashboard/payroll", icon: Calculator },
    { name: "ตั้งค่าระบบ (อัปโหลดภาพ)", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm h-14 flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Samkok Hospital Logo" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
          </Link>
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              type="search" 
              placeholder="ค้นหา..." 
              className="w-64 pl-9 bg-[#f0f2f5] border-none rounded-full h-10 focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] w-10 h-10">
            <Menu className="h-5 w-5 text-black" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] w-10 h-10">
            <Bell className="h-5 w-5 text-black" />
          </Button>
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-300">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold">{user.username}</div>
              <div className="text-xs text-gray-500">{user.roles?.[0]}</div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] w-10 h-10" onClick={handleLogout}>
              <LogOut className="h-5 w-5 text-black" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[280px] hidden lg:flex flex-col p-2 overflow-y-auto print:hidden">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive ? "bg-[#e4e6eb] text-black" : "text-gray-700 hover:bg-[#e4e6eb]"
                  }`}>
                    <item.icon className={`h-6 w-6 ${isActive ? "text-[#1877f2]" : "text-gray-500"}`} />
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
