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
  Briefcase,
  Clock
} from "lucide-react";

import axios from "axios";
import { API_URL } from "@/lib/config";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;
      const res = await axios.get(`${API_URL}/users/my-notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (e) {
      console.error("Fetch notifications error:", e);
    }
  };

  const markAllRead = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;
      await axios.patch(`${API_URL}/users/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]);
      setShowNotifications(false);
    } catch (e) {
      console.error("Mark all read error:", e);
    }
  };

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

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 45000); // Poll every 45s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/");
  };

  if (!user) return null;

  const navItems = [
    { name: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
    { name: "ผู้ใช้งาน", href: "/dashboard/users", icon: Users },
    { name: "พนักงาน", href: "/dashboard/employees", icon: Users },
    { name: "กลุ่มงาน", href: "/dashboard/departments", icon: FolderKanban },
    { name: "ประเภทพนักงาน", href: "/dashboard/employee-types", icon: FolderKanban },
    { name: "ตำแหน่ง", href: "/dashboard/positions", icon: Briefcase },
    { name: "ตั้งค่ารายรับ/รายจ่าย", href: "/dashboard/pay-items", icon: Settings },
    { name: "ประมวลผลเงินเดือน", href: "/dashboard/payroll", icon: Calculator },
    { name: "ตั้งค่าระบบ (อัปโหลดภาพ)", href: "/dashboard/settings", icon: Settings },
  ];

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
              className="w-64 pl-9 bg-[#f0f2f5] border-none rounded-full h-10 focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] w-10 h-10">
            <Menu className="h-5 w-5 text-black" />
          </Button>

          {/* Notification Bell */}
          {notifications.length > 0 ? (
            <Popover open={showNotifications} onOpenChange={setShowNotifications}>
              <PopoverTrigger 
                className="relative rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] w-10 h-10 flex items-center justify-center transition-colors cursor-pointer border-0"
                title={`การแจ้งเตือน (${notifications.length})`}
              >
                <Bell className="h-5 w-5 text-black" />
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm">
                  {notifications.length > 99 ? "99+" : notifications.length}
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 mr-4 mt-2 bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden" align="end">
                <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-sm">การแจ้งเตือน ({notifications.length})</span>
                  </div>
                  <button onClick={markAllRead} className="text-xs text-[#1877f2] hover:underline font-medium cursor-pointer">
                    อ่านทั้งหมด
                  </button>
                </div>
                <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-100">
                  {notifications.map(notif => (
                    <div key={notif.id} className="p-3 hover:bg-gray-50 transition-colors">
                      <div className="font-semibold text-xs text-gray-900">{notif.title}</div>
                      <div className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</div>
                      <div className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Button variant="ghost" size="icon" className="rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] w-10 h-10 opacity-70" title="ไม่มีการแจ้งเตือน">
              <Bell className="h-5 w-5 text-gray-600" />
            </Button>
          )}

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
