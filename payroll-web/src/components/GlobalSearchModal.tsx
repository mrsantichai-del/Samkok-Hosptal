"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
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
  Plus, 
  FileText, 
  DollarSign, 
  Users, 
  Download, 
  Sparkles, 
  ChevronRight, 
  X, 
  CornerDownLeft
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: "โมดูลระบบ" | "ทางลัดด่วน" | "ตั้งค่า & จัดการ";
  href: string;
  icon: any;
  color: string;
  roles: string[];
  keywords: string[];
}

const SEARCH_DATABASE: SearchItem[] = [
  // 1. Core Modules
  {
    id: "home",
    title: "หน้าหลัก (Launcher Home)",
    subtitle: "ศูนย์รวมทางลัดการใช้งานระบบและแดชบอร์ดภาพรวม",
    category: "โมดูลระบบ",
    href: "/home",
    icon: Home,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    roles: ["ALL"],
    keywords: ["หน้าหลัก", "home", "launcher", "แดชบอร์ด", "เมนู", "เริ่มต้น"]
  },
  {
    id: "my-payslips",
    title: "สลิปของฉัน & 50 ทวิ (Employee Portal)",
    subtitle: "ดูสลิปเงินเดือนย้อนหลัง สั่งพิมพ์สลิป และพิมพ์หนังสือรับรองภาษี 50 ทวิ",
    category: "โมดูลระบบ",
    href: "/my-payslips",
    icon: ReceiptText,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    roles: ["ALL"],
    keywords: ["สลิป", "payslip", "สลิปเงินเดือน", "50 ทวิ", "หนังสือรับรองภาษี", "ภาษี", "หัก ณ ที่จ่าย", "tax", "เงินเดือนของฉัน", "ytd"]
  },
  {
    id: "analytics",
    title: "แดชบอร์ดผู้บริหาร (Executive Analytics)",
    subtitle: "วิเคราะห์ภาพรวมค่าใช้จ่ายเงินเดือนหลายมิติ กลุ่มงาน ตำแหน่ง และ Drill-down",
    category: "โมดูลระบบ",
    href: "/analytics",
    icon: BarChart3,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    roles: ["Admin", "Executive", "HR"],
    keywords: ["แดชบอร์ด", "analytics", "วิเคราะห์", "กราฟ", "ผู้บริหาร", "ค่าใช้จ่าย", "สถิติ", "chart", "drilldown"]
  },
  {
    id: "reports",
    title: "ศูนย์รวมรายงาน (Reports Center)",
    subtitle: "รายงานสรุปกลุ่มงาน, นำส่งธนาคาร, สรรพากร, สปส., กบข. พร้อม Export Excel",
    category: "โมดูลระบบ",
    href: "/reports",
    icon: FileSpreadsheet,
    color: "text-amber-600 bg-amber-50 border-amber-200",
    roles: ["Admin", "Executive", "HR"],
    keywords: ["รายงาน", "report", "reports", "excel", "ส่งออก", "export", "ธนาคาร", "สรรพากร", "ประกันสังคม", "กบข", "ภาษีหัก ณ ที่จ่าย"]
  },
  {
    id: "payroll",
    title: "ประมวลผลเงินเดือน (Payroll Processing)",
    subtitle: "สร้างรอบเงินเดือน คำนวณรายได้รายหักอัตโนมัติตามสูตร และส่งขออนุมัติ",
    category: "โมดูลระบบ",
    href: "/payroll",
    icon: Calculator,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    roles: ["Admin", "HR"],
    keywords: ["ประมวลผลเงินเดือน", "payroll", "คำนวณเงินเดือน", "รอบเงินเดือน", "งวดเงินเดือน", "อนุมัติเงินเดือน", "ot", "ค่าเวร"]
  },
  {
    id: "employees",
    title: "ทะเบียนประวัติบุคลากร (Employee Directory)",
    subtitle: "จัดการรายชื่อพนักงาน บันทึกเลขบัตร 13 หลัก ฐานเงินเดือน และ Import Excel",
    category: "โมดูลระบบ",
    href: "/employees",
    icon: Contact,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    roles: ["Admin", "HR"],
    keywords: ["พนักงาน", "employee", "บุคลากร", "เจ้าหน้าที่", "ประวัติ", "เลขบัตรประชาชน", "13 หลัก", "นำเข้าพนักงาน", "excel"]
  },
  {
    id: "departments",
    title: "กลุ่มงานและแผนก (Departments)",
    subtitle: "จัดการโครงสร้างกลุ่มงานและหน่วยงานภายในโรงพยาบาลสามโคก",
    category: "โมดูลระบบ",
    href: "/departments",
    icon: FolderKanban,
    color: "text-cyan-600 bg-cyan-50 border-cyan-200",
    roles: ["Admin", "HR"],
    keywords: ["กลุ่มงาน", "แผนก", "department", "หน่วยงาน", "ฝ่าย", "โครงสร้าง"]
  },
  {
    id: "employee-types",
    title: "ประเภทการจ้างงาน (Employee Types)",
    subtitle: "ข้าราชการ, ลูกจ้างประจำ, พนักงานราชการ, พนักงานกระทรวงฯ, ลูกจ้างชั่วคราว",
    category: "โมดูลระบบ",
    href: "/employee-types",
    icon: Building2,
    color: "text-teal-600 bg-teal-50 border-teal-200",
    roles: ["Admin", "HR"],
    keywords: ["ประเภทพนักงาน", "ประเภทการจ้าง", "employee type", "ข้าราชการ", "ลูกจ้าง", "พนักงานราชการ", "สัญญาจ้าง"]
  },
  {
    id: "positions",
    title: "ตำแหน่งและสายวิชาชีพ (Positions)",
    subtitle: "กำหนดชื่อตำแหน่งวิชาชีพทางการแพทย์ พยาบาล เภสัชกร และสายสนับสนุน",
    category: "โมดูลระบบ",
    href: "/positions",
    icon: Briefcase,
    color: "text-sky-600 bg-sky-50 border-sky-200",
    roles: ["Admin", "HR"],
    keywords: ["ตำแหน่ง", "position", "สายวิชาชีพ", "แพทย์", "พยาบาล", "เภสัชกร", "วิชาชีพ"]
  },
  {
    id: "pay-items",
    title: "ตั้งค่ารายรับ-รายจ่าย & สูตรคำนวณ (Pay Items)",
    subtitle: "รายการได้-หัก (เงินเดือน, OT, ค่าเวร, พ.ต.ส., ภาษี, ประกันสังคม) และสูตรอัตโนมัติ",
    category: "โมดูลระบบ",
    href: "/pay-items",
    icon: SlidersHorizontal,
    color: "text-amber-600 bg-amber-50 border-amber-200",
    roles: ["Admin", "HR"],
    keywords: ["รายรับ", "รายจ่าย", "สูตรคำนวณ", "pay item", "เงินได้", "เงินหัก", "ot", "พตส", "ค่าเวร", "เบี้ยเลี้ยง"]
  },
  {
    id: "users",
    title: "จัดการบัญชีผู้ใช้งาน (User Management)",
    subtitle: "จัดการบัญชีผู้ใช้ รหัสผ่าน ผูกบัญชีพนักงาน และอัปโหลดลายเซ็นดิจิทัลผู้อนุมัติ",
    category: "ตั้งค่า & จัดการ",
    href: "/users",
    icon: UserCog,
    color: "text-red-600 bg-red-50 border-red-200",
    roles: ["Admin"],
    keywords: ["ผู้ใช้งาน", "user", "บัญชีผู้ใช้", "รหัสผ่าน", "password", "ลายเซ็น", "signature", "ผูกพนักงาน", "รีเซ็ตรหัสผ่าน"]
  },
  {
    id: "roles",
    title: "กลุ่มผู้ใช้งานและกำหนดสิทธิ์ (Roles & Matrix)",
    subtitle: "กำหนดขอบเขตอำนาจหน้าที่ของกลุ่มผู้ใช้ และตรวจสอบตาราง Matrix สิทธิ์ 13 โมดูล",
    category: "ตั้งค่า & จัดการ",
    href: "/roles",
    icon: ShieldAlert,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    roles: ["Admin"],
    keywords: ["กลุ่มผู้ใช้", "สิทธิ์", "role", "roles", "สิทธิ์การใช้งาน", "rbac", "matrix", "สิทธิ์ 13 โมดูล", "permission"]
  },
  {
    id: "audit-logs",
    title: "ประวัติการใช้งานระบบ (Audit & Activity Logs)",
    subtitle: "ตรวจสอบบันทึกการเข้าใช้ สร้าง แก้ไข ลบ พิมพ์ ส่งออก พร้อม Diff View ย้อนหลัง",
    category: "ตั้งค่า & จัดการ",
    href: "/audit-logs",
    icon: ScrollText,
    color: "text-rose-600 bg-rose-50 border-rose-200",
    roles: ["Admin", "Executive"],
    keywords: ["ประวัติ", "audit", "log", "logs", "ประวัติการใช้งาน", "ตรวจสอบ", "กิจกรรม", "ย้อนหลัง", "diff"]
  },
  {
    id: "settings",
    title: "ตั้งค่าโรงพยาบาลและระบบ (Hospital Settings)",
    subtitle: "ข้อมูลนิติบุคคล เลขประจำตัวผู้เสียภาษี 13 หลัก ที่อยู่ และตราสัญลักษณ์โรงพยาบาล",
    category: "ตั้งค่า & จัดการ",
    href: "/settings",
    icon: Settings2,
    color: "text-slate-600 bg-slate-50 border-slate-200",
    roles: ["Admin"],
    keywords: ["ตั้งค่า", "setting", "settings", "โรงพยาบาล", "โลโก้", "logo", "เลขผู้เสียภาษี", "13 หลัก", "ที่อยู่"]
  },

  // 2. Quick Actions
  {
    id: "quick-new-payroll",
    title: "เริ่มประมวลผลเงินเดือนรอบใหม่",
    subtitle: "คำนวณรายได้-รายหักของพนักงานทุกคนตามรอบประจำเดือน",
    category: "ทางลัดด่วน",
    href: "/payroll",
    icon: Plus,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    roles: ["Admin", "HR"],
    keywords: ["เริ่มคำนวณ", "ประมวลผลใหม่", "สร้างรอบเงินเดือน", "จ่ายเงินเดือน", "งวดใหม่"]
  },
  {
    id: "quick-print-payslip",
    title: "พิมพ์สลิปเงินเดือนของฉัน",
    subtitle: "พิมพ์เอกสารใบแจ้งรายการเงินเดือนและค่าตอบแทน (Pay Slip) ล่าสุด",
    category: "ทางลัดด่วน",
    href: "/my-payslips",
    icon: ReceiptText,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    roles: ["ALL"],
    keywords: ["พิมพ์สลิป", "print payslip", "สลิปล่าสุด", "ใบรับรองเงินเดือน"]
  },
  {
    id: "quick-print-50tawi",
    title: "พิมพ์หนังสือรับรองภาษี 50 ทวิ",
    subtitle: "พิมพ์หนังสือรับรองการหักภาษี ณ ที่จ่ายประจำปีสำหรับยื่นแบบภาษี ภ.ง.ด.",
    category: "ทางลัดด่วน",
    href: "/my-payslips",
    icon: FileText,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    roles: ["ALL"],
    keywords: ["พิมพ์ 50 ทวิ", "50 ทวิ", "ภาษีประจำปี", "ภงด", "หักภาษี"]
  },
  {
    id: "quick-export-excel",
    title: "ส่งออกรายงานสรุปผู้บริหารเป็น Excel",
    subtitle: "ดาวน์โหลดสถิติค่าใช้จ่ายบุคลากรและเงินเดือนจำแนกตามมิติต่างๆ",
    category: "ทางลัดด่วน",
    href: "/reports",
    icon: Download,
    color: "text-green-600 bg-green-50 border-green-200",
    roles: ["Admin", "Executive", "HR"],
    keywords: ["ส่งออก excel", "export excel", "รายงาน excel", "ดาวน์โหลดรายงาน"]
  }
];

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRoles: string[];
  isAdmin: boolean;
  isHR: boolean;
  isExecutive: boolean;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  userRoles,
  isAdmin,
  isHR,
  isExecutive
}: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter items based on user permissions (RBAC)
  const allowedItems = useMemo(() => {
    return SEARCH_DATABASE.filter(item => {
      if (isAdmin) return true;
      if (item.roles.includes("ALL")) return true;
      if (isHR && item.roles.includes("HR")) return true;
      if (isExecutive && item.roles.includes("Executive")) return true;
      return item.roles.some(r => userRoles.includes(r));
    });
  }, [userRoles, isAdmin, isHR, isExecutive]);

  // Filter matching items by search query
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Return top recommended shortcuts when query is empty
      return allowedItems.slice(0, 8);
    }

    return allowedItems.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSub = item.subtitle.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some(k => k.toLowerCase().includes(q));
      const matchCategory = item.category.toLowerCase().includes(q);
      return matchTitle || matchSub || matchKeywords || matchCategory;
    });
  }, [allowedItems, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (item: SearchItem) => {
    onClose();
    router.push(item.href);
  };

  // Keyboard navigation (Arrow up, Arrow down, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredResults.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredResults.length) % (filteredResults.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[620px] p-0 gap-0 overflow-hidden bg-white rounded-2xl shadow-2xl border border-gray-200">
        {/* Search Header Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-200 bg-gray-50/50">
          <Search className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ค้นหาเมนู, ฟังก์ชัน, รายงาน, สลิป, 50 ทวิ, ภาษี, ประวัติ..."
            className="w-full bg-transparent border-none text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden font-medium"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-mono text-gray-400 bg-gray-200/70 px-2 py-0.5 rounded border border-gray-300">
              <span>ESC</span>
            </div>
          )}
        </div>

        {/* Search Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <Search className="w-10 h-10 mx-auto text-gray-300" />
              <p className="text-sm font-semibold text-gray-700">ไม่พบเมนูหรือฟังก์ชันที่ตรงกับ \"{query}\"</p>
              <p className="text-xs text-gray-400">ลองค้นหาด้วยคำอื่น เช่น สลิป, เงินเดือน, ภาษี, พนักงาน, รายงาน, หรือ audit</p>
            </div>
          ) : (
            <div>
              {!query && (
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> แนะนำ & เข้าถึงบ่อย
                </div>
              )}
              {filteredResults.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-[#1877f2]/10 text-[#1877f2]" 
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg border shrink-0 ${item.color}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs font-bold truncate ${isSelected ? "text-[#1877f2]" : "text-gray-900"}`}>
                            {item.title}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-medium shrink-0">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-[#1877f2] bg-[#1877f2]/10 px-2 py-0.5 rounded border border-[#1877f2]/30">
                          <span>เปิด</span>
                          <CornerDownLeft className="w-3 h-3" />
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 font-mono text-[10px] font-semibold border border-gray-300">↑</span>
              <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 font-mono text-[10px] font-semibold border border-gray-300">↓</span>
              <span className="ml-0.5">เลื่อนเลือก</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 font-mono text-[10px] font-semibold border border-gray-300">↵ Enter</span>
              <span className="ml-0.5">เปิดหน้า</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <span>กด</span>
            <kbd className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded font-mono font-bold">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded font-mono font-bold">K</kbd>
            <span>เพื่อค้นหาได้ทุกที่</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
