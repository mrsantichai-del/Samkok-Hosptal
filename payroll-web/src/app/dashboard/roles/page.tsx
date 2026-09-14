"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, Plus, Edit, Trash2, Check, ArrowUpDown, 
  Shield, Users, UserCheck, ShieldAlert, KeyRound, Building2, 
  FileText, DollarSign, BarChart3, Settings, HelpCircle, CheckCircle2,
  XCircle, Lock, Unlock, Eye, Sparkles, Filter, Info, ChevronRight,
  ShieldCheck, ShieldQuestion, Users2
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { API_URL } from "@/lib/config";

// Preset Role Description Templates for quick selection
const ROLE_TEMPLATES = [
  {
    name: "System Administrator",
    title: "ผู้ดูแลระบบสูงสุด",
    desc: "ผู้ดูแลระบบสูงสุด ได้รับอนุญาตให้เข้าถึงและจัดการได้ทุกโมดูล 100% (ดู, สร้าง, แก้ไข, ลบ, อนุมัติ, ส่งออกข้อมูล) จัดการบัญชีผู้ใช้ รีเซ็ตรหัสผ่าน กำหนดกลุ่มสิทธิ์ โครงสร้างกลุ่มงาน ตำแหน่งงาน ประเภทบุคลากร สูตรคำนวณเงินเดือน และตั้งค่าโรงพยาบาลสำหรับออกเอกสารราชการ สามารถสลับดูสลิปเงินเดือนและใบ 50 ทวิของพนักงานทุกคนได้โดยไม่จำเป็นต้องเป็นพนักงาน"
  },
  {
    name: "Executive",
    title: "ผู้บริหาร / ผู้อำนวยการ",
    desc: "ผู้บริหาร / ผู้อำนวยการโรงพยาบาล เข้าถึงแดชบอร์ดภาพรวมค่าใช้จ่ายเงินเดือนหลายมิติ (Executive Analytics) ตรวจสอบรายงานเชิงลึก (Drill-down) ทุกมิติ ตรวจสอบยอดและกด 'อนุมัติจ่าย' หรือ 'ส่งกลับแก้ไข' รอบการจ่ายเงินเดือน เรียกดูและส่งออกศูนย์รวมรายงาน (Reports) และเรียกดูสลิปเงินเดือน & 50 ทวิของตนเอง (ไม่มีสิทธิ์แก้ไขข้อมูลพนักงาน สูตรคำนวณ หรือตั้งค่าระบบ)"
  },
  {
    name: "HR",
    title: "เจ้าหน้าที่บุคคลและการเงิน",
    desc: "เจ้าหน้าที่ทรัพยากรบุคคลและการเงิน จัดการทะเบียนประวัติพนักงานทั้งหมด (เพิ่ม/แก้ไข/บันทึกเลขบัตร ปชช. 13 หลัก/ฐานเงินเดือน/นำเข้า Excel) ประมวลผลและคำนวณเงินเดือนอัตโนมัติ บันทึกค่าเวร/OT ส่งขออนุมัติจ่ายเงินเดือน ออกรายงานสรุปนำส่งธนาคาร สรรพากร สปส. กบข. ออกหนังสือรับรองการหักภาษี 50 ทวิให้แก่พนักงานทุกคน และเรียกดูสลิปของตนเอง"
  },
  {
    name: "Employee",
    title: "บุคลากรทั่วไป (Staff)",
    desc: "กลุ่ม Employee จะสามารถเข้ามาดูแล้วเห็นแค่ข้อมูลของตัวเอง สามารถสั่งพิมพ์สลิปเงินเดือน (Payslip) ของตนเอง เรียกดูและพิมพ์หนังสือรับรองการหักภาษี ณ ที่จ่าย (ใบ 50 ทวิ) ของตนเอง ตรวจสอบยอดสะสมประจำปี (YTD) และเปลี่ยนรหัสผ่านของตนเองได้ ส่วนอย่างอื่นและข้อมูลทางการเงินของผู้อื่นจะมองไม่เห็นทั้งหมด"
  }
];

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [filterMemberCount, setFilterMemberCount] = useState("ALL");

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: "name",
    direction: "asc"
  });

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [currentRole, setCurrentRole] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_URL}/users/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(res.data || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "ไม่สามารถดึงข้อมูลกลุ่มผู้ใช้งานได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openAddDialog = () => {
    setFormData({
      name: "",
      description: ""
    });
    setIsAddOpen(true);
  };

  const openEditDialog = (role: any) => {
    setCurrentRole(role);
    setFormData({
      name: role.name,
      description: role.description || ""
    });
    setIsEditOpen(true);
  };

  const openViewDialog = (role: any) => {
    setCurrentRole(role);
    setIsViewOpen(true);
  };

  const openDeleteDialog = (role: any) => {
    setCurrentRole(role);
    setIsDeleteOpen(true);
  };

  const applyTemplate = (template: any) => {
    setFormData({
      name: template.name,
      description: template.desc
    });
  };

  const handleSave = async (isEdit: boolean) => {
    if (!formData.name.trim()) {
      return toast.error("กรุณาระบุชื่อกลุ่มผู้ใช้งาน");
    }

    setSaving(true);
    const toastId = toast.loading(isEdit ? "กำลังอัปเดตกลุ่มผู้ใช้งาน..." : "กำลังสร้างกลุ่มผู้ใช้งานใหม่...");

    try {
      const token = Cookies.get("token");
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim()
      };

      if (isEdit) {
        await axios.patch(`${API_URL}/users/roles/${currentRole.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("แก้ไขกลุ่มผู้ใช้งานสำเร็จ", { id: toastId });
      } else {
        await axios.post(`${API_URL}/users/roles`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("สร้างกลุ่มผู้ใช้งานใหม่สำเร็จ", { id: toastId });
      }

      setIsAddOpen(false);
      setIsEditOpen(false);
      fetchRoles();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึก", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentRole) return;
    setSaving(true);
    const toastId = toast.loading("กำลังลบกลุ่มผู้ใช้งาน...");

    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_URL}/users/roles/${currentRole.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("ลบกลุ่มผู้ใช้งานสำเร็จ", { id: toastId });
      setIsDeleteOpen(false);
      fetchRoles();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการลบ", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper to determine Role Level & Color Styling
  const getRoleBadge = (roleName: string) => {
    const s = (roleName || '').toLowerCase();
    if (s.includes('admin') || s.includes('ผู้ดูแลระบบ')) {
      return {
        label: "ผู้ดูแลระบบสูงสุด (Super Admin)",
        badge: "bg-red-50 text-red-700 border-red-200",
        tag: "ADMIN",
        icon: ShieldAlert
      };
    }
    if (s.includes('exec') || s.includes('ผู้บริหาร') || s.includes('director')) {
      return {
        label: "ระดับบริหาร (Executive)",
        badge: "bg-purple-50 text-purple-700 border-purple-200",
        tag: "EXECUTIVE",
        icon: BarChart3
      };
    }
    if (s.includes('hr') || s.includes('บุคคล') || s.includes('การเงิน') || s.includes('finance')) {
      return {
        label: "ระดับปฏิบัติการ (HR & Finance)",
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        tag: "HR",
        icon: DollarSign
      };
    }
    return {
      label: "บุคลากรทั่วไป (Staff)",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      tag: "EMPLOYEE",
      icon: UserCheck
    };
  };

  // Filter & Sort Logic
  const processedRoles = useMemo(() => {
    let list = [...roles];

    // Search filter
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(r => 
        r.name.toLowerCase().includes(s) ||
        (r.description || '').toLowerCase().includes(s)
      );
    }

    // Role level filter
    if (filterLevel !== "ALL") {
      list = list.filter(r => {
        const info = getRoleBadge(r.name);
        return info.tag === filterLevel;
      });
    }

    // Member count filter
    if (filterMemberCount === "HAS_USERS") {
      list = list.filter(r => (r.users?.length || 0) > 0);
    } else if (filterMemberCount === "EMPTY") {
      list = list.filter(r => (r.users?.length || 0) === 0);
    }

    // Sorting
    list.sort((a, b) => {
      let valA: any = a[sortConfig.key];
      let valB: any = b[sortConfig.key];

      if (sortConfig.key === "userCount") {
        valA = a.users?.length || 0;
        valB = b.users?.length || 0;
      } else if (sortConfig.key === "name") {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [roles, searchTerm, filterLevel, filterMemberCount, sortConfig]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users2 className="w-7 h-7 text-indigo-600" /> จัดการกลุ่มผู้ใช้งานและสิทธิ์ (User Groups & Roles)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            กำหนดกลุ่มผู้ใช้งาน อธิบายขอบเขตหน้าที่ความรับผิดชอบ และคำบรรยายสิทธิ์การเข้าถึงแต่ละโมดูลกันลืม
          </p>
        </div>

        <Button className="bg-[#1877f2] hover:bg-[#166fe5] text-xs h-9 cursor-pointer shadow-xs" onClick={openAddDialog}>
          <Plus className="mr-1.5 h-4 w-4" /> เพิ่มกลุ่มผู้ใช้งานใหม่
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="bg-white shadow-sm border-gray-200">
        {/* Filter Bar (Styled identically to Users Module) */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="ค้นหาชื่อกลุ่ม / คำอธิบายสิทธิ์..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Filter by Role Level */}
            <div className="flex items-center gap-2">
              <Label className="text-xs font-semibold whitespace-nowrap">ระดับสิทธิ์:</Label>
              <select 
                className="h-9 border rounded px-2.5 text-xs bg-gray-50 cursor-pointer font-medium" 
                value={filterLevel} 
                onChange={e => setFilterLevel(e.target.value)}
              >
                <option value="ALL">ทั้งหมด (All Levels)</option>
                <option value="ADMIN">🔴 ผู้ดูแลระบบสูงสุด (Super Admin)</option>
                <option value="EXECUTIVE">🟣 ระดับบริหาร (Executive)</option>
                <option value="HR">🔵 การเงิน/บุคคล (HR & Finance)</option>
                <option value="EMPLOYEE">🟢 บุคลากรทั่วไป (Employee / Staff)</option>
              </select>
            </div>

            {/* Filter by Member Status */}
            <div className="flex items-center gap-2">
              <Label className="text-xs font-semibold whitespace-nowrap">สมาชิกในกลุ่ม:</Label>
              <select 
                className="h-9 border rounded px-2.5 text-xs bg-gray-50 cursor-pointer font-medium" 
                value={filterMemberCount} 
                onChange={e => setFilterMemberCount(e.target.value)}
              >
                <option value="ALL">ทั้งหมด (All)</option>
                <option value="HAS_USERS">มีผู้ใช้งานในกลุ่ม</option>
                <option value="EMPTY">ยังไม่มีผู้ใช้งาน</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            แสดงผล <b>{processedRoles.length}</b> จาก <b>{roles.length}</b> กลุ่ม
          </div>
        </div>

        {/* Roles Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="w-[60px] text-center text-xs">ลำดับ</TableHead>
              <TableHead className="w-[220px]">
                <Button variant="ghost" onClick={() => requestSort("name")} className="font-bold p-0 h-auto hover:bg-transparent text-xs">
                  ชื่อกลุ่มผู้ใช้งาน (Role Name) <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <span className="font-bold text-xs text-gray-700">
                  คำบรรยายสิทธิ์การทำงานและขอบเขตหน้าที่ (Scope of Permissions & Description)
                </span>
              </TableHead>
              <TableHead className="w-[150px] text-center">
                <Button variant="ghost" onClick={() => requestSort("userCount")} className="font-bold p-0 h-auto hover:bg-transparent text-xs">
                  ผู้ใช้งานในกลุ่ม <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[130px] text-center text-xs font-bold">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500 text-xs">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-2"></div>
                  กำลังโหลดข้อมูลกลุ่มผู้ใช้งาน...
                </TableCell>
              </TableRow>
            ) : processedRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-400 text-xs">
                  <ShieldQuestion className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  ไม่พบข้อมูลกลุ่มผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหา
                </TableCell>
              </TableRow>
            ) : (
              processedRoles.map((role, idx) => {
                const badgeInfo = getRoleBadge(role.name);
                const isSystemDefault = ['System Administrator', 'Admin', 'HR', 'Executive', 'Employee'].includes(role.name);
                const userCount = role.users?.length || 0;

                return (
                  <TableRow key={role.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Index */}
                    <TableCell className="text-center text-gray-500 text-xs align-top pt-4">
                      {idx + 1}
                    </TableCell>

                    {/* Role Name & Badge */}
                    <TableCell className="align-top pt-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-gray-900 text-xs">{role.name}</span>
                          {isSystemDefault && (
                            <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-mono font-medium" title="กลุ่มหลักของระบบ">
                              System
                            </span>
                          )}
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeInfo.badge}`}>
                          <badgeInfo.icon className="w-3 h-3" />
                          {badgeInfo.label}
                        </span>
                      </div>
                    </TableCell>

                    {/* Detailed Description */}
                    <TableCell className="align-top pt-4">
                      <div className="space-y-2 max-w-2xl">
                        <p className="text-xs text-gray-700 leading-relaxed font-normal">
                          {role.description || (
                            <span className="text-gray-400 italic">ยังไม่ได้ระบุคำบรรยายหน้าที่</span>
                          )}
                        </p>
                      </div>
                    </TableCell>

                    {/* User Count & Avatars */}
                    <TableCell className="text-center align-top pt-4">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                          userCount > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Users className="w-3.5 h-3.5" />
                          {userCount} บัญชี
                        </span>
                        {userCount > 0 && (
                          <span 
                            onClick={() => openViewDialog(role)}
                            className="text-[10px] text-blue-600 hover:underline cursor-pointer font-medium"
                          >
                            คลิกดูรายชื่อ
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-center align-top pt-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Details */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 cursor-pointer" 
                          onClick={() => openViewDialog(role)}
                          title="ดูรายละเอียดสิทธิ์และสมาชิก"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Edit */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer" 
                          onClick={() => openEditDialog(role)}
                          title="แก้ไขชื่อและคำบรรยายสิทธิ์"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Delete */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`h-8 w-8 p-0 ${
                            isSystemDefault || userCount > 0 
                              ? 'text-gray-300 bg-gray-50 cursor-not-allowed' 
                              : 'text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer'
                          }`}
                          onClick={() => {
                            if (isSystemDefault) {
                              toast.info(`กลุ่ม "${role.name}" เป็นกลุ่มหลักของระบบ ไม่สามารถลบได้`);
                              return;
                            }
                            if (userCount > 0) {
                              toast.warning(`มีผู้ใช้งานอยู่ในกลุ่มนี้ ${userCount} คน กรุณาย้ายผู้ใช้ออกก่อนลบ`);
                              return;
                            }
                            openDeleteDialog(role);
                          }}
                          title={isSystemDefault ? "กลุ่มหลักของระบบไม่สามารถลบได้" : userCount > 0 ? "ไม่สามารถลบกลุ่มที่มีผู้ใช้งานอยู่ได้" : "ลบกลุ่ม"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ========================================================================= */}
      {/* ADD / EDIT ROLE DIALOG */}
      {/* ========================================================================= */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) { setIsAddOpen(false); setIsEditOpen(false); }
      }}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              {isEditOpen ? `แก้ไขกลุ่มผู้ใช้งาน: ${currentRole?.name}` : "เพิ่มกลุ่มผู้ใช้งานใหม่"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              กำหนดชื่อกลุ่มและเขียนคำบรรยายอธิบายขอบเขตสิทธิ์การทำงานอย่างละเอียด
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Quick Template Selector */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-xl border border-indigo-100 space-y-2">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> เลือกเทมเพลตคำบรรยายสิทธิ์มาตรฐาน:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ROLE_TEMPLATES.map((tmpl, tIdx) => (
                  <button
                    key={tIdx}
                    type="button"
                    onClick={() => applyTemplate(tmpl)}
                    className="text-[11px] font-medium px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white text-gray-700 rounded-lg border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    + {tmpl.title} ({tmpl.name})
                  </button>
                ))}
              </div>
            </div>

            {/* Role Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">
                ชื่อกลุ่มผู้ใช้งาน (Role Name) <span className="text-red-500">*</span>
              </Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="เช่น System Administrator, Executive, HR, Employee, หัวหน้ากลุ่มงาน"
                className="text-xs h-9 font-medium"
              />
            </div>

            {/* Long Detailed Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>คำบรรยายสิทธิ์การทำงานและขอบเขตหน้าที่ (Description) <span className="text-red-500">*</span></span>
                <span className="text-[10px] text-gray-400 font-normal">คำบรรยายยาวๆ กันลืม</span>
              </Label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="ระบุคำบรรยายหน้าที่อย่างละเอียด เช่น: กลุ่ม Employee จะสามารถเข้ามาดูแล้วเห็นแค่ข้อมูลของตัวเอง สามารถเปลี่ยนรหัสผ่านของตัวเองได้ ส่วนอย่างอื่นมองไม่เห็น..."
                rows={6}
                className="text-xs leading-relaxed"
              />
              <p className="text-[11px] text-gray-500">
                💡 คำบรรยายนี้จะช่วยให้ผู้ดูแลระบบและฝ่ายบริหารเข้าใจขอบเขตอำนาจหน้าที่ของกลุ่มนี้อย่างชัดเจน
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>
              ยกเลิก
            </Button>
            <Button size="sm" className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={() => handleSave(isEditOpen)} disabled={saving}>
              {saving ? "กำลังบันทึก..." : "บันทึกกลุ่มผู้ใช้งาน"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* VIEW DETAILS DIALOG (Members & Full Permissions) */}
      {/* ========================================================================= */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-indigo-600" />
              รายละเอียดกลุ่มผู้ใช้งาน: {currentRole?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              คำบรรยายสิทธิ์และรายชื่อผู้ใช้งานที่สังกัดกลุ่มนี้
            </DialogDescription>
          </DialogHeader>

          {currentRole && (
            <div className="space-y-4 py-2">
              {/* Description Card */}
              <div className="bg-gray-50 p-4 rounded-xl border space-y-2">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-600" /> ขอบเขตหน้าที่และสิทธิ์การทำงาน:
                </span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {currentRole.description || "ยังไม่มีคำบรรยายสิทธิ์"}
                </p>
              </div>

              {/* Members in Role Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    รายชื่อผู้ใช้งานในกลุ่มนี้ ({currentRole.users?.length || 0} บัญชี)
                  </h4>
                </div>

                <div className="border rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="text-xs">ชื่อผู้ใช้งาน</TableHead>
                        <TableHead className="text-xs">พนักงานที่ผูก</TableHead>
                        <TableHead className="text-xs text-center">สถานะ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(!currentRole.users || currentRole.users.length === 0) ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-6 text-xs text-gray-400">
                            ยังไม่มีผู้ใช้งานในกลุ่มนี้
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentRole.users.map((ur: any, uIdx: number) => {
                          const u = ur.user;
                          return (
                            <TableRow key={ur.id || uIdx}>
                              <TableCell className="text-xs font-medium">
                                <div className="flex items-center gap-2">
                                  {u.imgUrl ? (
                                    <img src={u.imgUrl} alt="" className="w-6 h-6 rounded-full object-cover border" />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 border">
                                      {u.username?.slice(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                  <span>{u.username}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs">
                                {u.employee ? (
                                  <div>
                                    <span className="font-semibold text-blue-700">{u.employee.employeeCode}</span>
                                    <span className="ml-1.5 text-gray-700">{u.employee.firstName} {u.employee.lastName}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">ไม่ได้ผูก</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center text-xs">
                                {u.isActive ? (
                                  <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-medium bg-green-100 text-green-800">
                                    เปิดใช้งาน
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-medium bg-red-100 text-red-800">
                                    ระงับ
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsViewOpen(false)}>
              ปิดหน้าต่าง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>ยืนยันการลบกลุ่มผู้ใช้งาน</DialogTitle>
          </DialogHeader>
          <div className="py-3 space-y-2">
            <p className="text-xs">
              คุณต้องการลบกลุ่มผู้ใช้งาน <strong>{currentRole?.name}</strong> ใช่หรือไม่?
            </p>
            <p className="text-xs text-red-500">
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>
              ยกเลิก
            </Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={saving}>
              {saving ? "กำลังลบ..." : "ยืนยันการลบ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
