"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Plus, Edit, Trash2, Check, ChevronsUpDown, ArrowUpDown, 
  Shield, Users, UserCheck, ShieldAlert, KeyRound, Building2, 
  FileText, DollarSign, BarChart3, Settings, HelpCircle, CheckCircle2,
  XCircle, Lock, Unlock, Eye, Sparkles, Filter
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/config";

// Definition of 12 Core System Modules and their Capabilities Matrix
const SYSTEM_CAPABILITIES = [
  {
    id: "home",
    module: "1. หน้าหลัก & ทางลัดระบบ (Launcher Home)",
    icon: Sparkles,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    description: "หน้าต้อนรับแสดง Quick Launcher Cards นำทางตามสิทธิ์ของผู้ใช้งาน",
    roles: {
      admin: { view: true, edit: true, delete: true, approve: true, export: true, note: "เข้าถึงได้ทุกการ์ดระบบ" },
      executive: { view: true, edit: false, delete: false, approve: true, export: true, note: "การ์ดแดชบอร์ด, รายงาน, อนุมัติ, สลิปตนเอง" },
      hr: { view: true, edit: true, delete: false, approve: false, export: true, note: "การ์ดเงินเดือน, บุคลากร, รายงาน, สลิปตนเอง" },
      employee: { view: true, edit: false, delete: false, approve: false, export: true, note: "เฉพาะการ์ดสลิปของฉัน & 50 ทวิ" }
    }
  },
  {
    id: "my_payslips",
    module: "2. สลิปของฉัน & 50 ทวิ (Employee Portal)",
    icon: FileText,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    description: "ศูนย์บริการข้อมูลเงินเดือนส่วนบุคคล ดูสลิปย้อนหลัง พิมพ์สลิป และพิมพ์หนังสือรับรอง 50 ทวิ",
    roles: {
      admin: { view: true, edit: true, delete: true, approve: true, export: true, note: "ดูและพิมพ์ของตนเอง และเลือกสลับดูพนักงานคนใดก็ได้" },
      executive: { view: true, edit: false, delete: false, approve: false, export: true, note: "ดูและพิมพ์สลิป & 50 ทวิของตนเอง และบุคลากรในสังกัด" },
      hr: { view: true, edit: true, delete: false, approve: false, export: true, note: "ดูและพิมพ์ของตนเอง และเลือกสลับดูพนักงานทุกคน" },
      employee: { view: true, edit: false, delete: false, approve: false, export: true, note: "ดูและพิมพ์เฉพาะสลิป & 50 ทวิ ของตนเองเท่านั้น" }
    }
  },
  {
    id: "analytics",
    module: "3. แดชบอร์ดผู้บริหาร (Executive Analytics)",
    icon: BarChart3,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    description: "วิเคราะห์ภาพรวมค่าใช้จ่ายเงินเดือนหลายมิติ (กลุ่มงาน, ประเภทการจ้าง, ตำแหน่ง) พร้อม Drill-down",
    roles: {
      admin: { view: true, edit: false, delete: false, approve: true, export: true, note: "เข้าถึงและเจาะลึกได้ทุกมิติ" },
      executive: { view: true, edit: false, delete: false, approve: true, export: true, note: "เข้าถึงภาพรวมและเจาะลึกรายงานย่อยได้ทุกมิติ" },
      hr: { view: true, edit: false, delete: false, approve: false, export: true, note: "ดูภาพรวมวิเคราะห์เพื่อวางแผนงบประมาณ" },
      employee: { view: false, edit: false, delete: false, approve: false, export: false, note: "ไม่มีสิทธิ์เข้าถึง (ซ่อนเมนู)" }
    }
  },
  {
    id: "reports",
    module: "4. ศูนย์รวมรายงาน (Reports Center)",
    icon: FileText,
    color: "text-amber-600 bg-amber-50 border-amber-200",
    description: "รายงานสรุปกลุ่มงาน, ประเภทการจ้าง, รายงานภาษีหัก ณ ที่จ่าย, ประกันสังคม, กบข./กสจ., บัญชีธนาคาร พร้อม Export Excel",
    roles: {
      admin: { view: true, edit: false, delete: false, approve: true, export: true, note: "ออกรายงานและ Export Excel ได้ทุกรายงาน" },
      executive: { view: true, edit: false, delete: false, approve: true, export: true, note: "ดูรายงานสรุปและส่งออกข้อมูลระดับผู้บริหาร" },
      hr: { view: true, edit: false, delete: false, approve: false, export: true, note: "ออกรายงานนำส่งธนาคาร, สรรพากร, สปส. และ กบข." },
      employee: { view: false, edit: false, delete: false, approve: false, export: false, note: "ไม่มีสิทธิ์เข้าถึง" }
    }
  },
  {
    id: "payroll",
    module: "5. ประมวลผลและคำนวณเงินเดือน (Payroll Processing)",
    icon: DollarSign,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    description: "สร้างรอบเงินเดือน คำนวณรายได้รายหักอัตโนมัติตามสูตร ปรับแก้รายบุคคล และส่งขออนุมัติ",
    roles: {
      admin: { view: true, edit: true, delete: true, approve: true, export: true, note: "ประมวลผล แก้ไขรอบเงินเดือน และอนุมัติได้ทุกขั้นตอน" },
      executive: { view: true, edit: false, delete: false, approve: true, export: true, note: "ตรวจสอบยอดและกด 'อนุมัติจ่าย' หรือ 'ส่งกลับแก้ไข'" },
      hr: { view: true, edit: true, delete: true, approve: false, export: true, note: "คำนวณเงินเดือน บันทึกค่าเวร/OT และส่งขออนุมัติผู้บริหาร" },
      employee: { view: false, edit: false, delete: false, approve: false, export: false, note: "ไม่มีสิทธิ์เข้าถึง" }
    }
  },
  {
    id: "employees",
    module: "6. ทะเบียนประวัติบุคลากร (Employee Directory)",
    icon: Users,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    description: "จัดการข้อมูลพนักงาน, เลขบัตร ปชช. 13 หลัก, ฐานเงินเดือน, สังกัดกลุ่มงาน, วันเข้า-ออกงาน, และ Import Excel",
    roles: {
      admin: { view: true, edit: true, delete: true, approve: true, export: true, note: "จัดการข้อมูลพนักงานทั้งหมด นำเข้าและส่งออก Excel" },
      executive: { view: true, edit: false, delete: false, approve: false, export: true, note: "ดูทำเนียบบุคลากรและโครงสร้างอัตรากำลัง" },
      hr: { view: true, edit: true, delete: true, approve: false, export: true, note: "เพิ่ม/แก้ไขพนักงาน บันทึกเลขบัตร ปชช. และปรับเงินเดือน" },
      employee: { view: false, edit: false, delete: false, approve: false, export: false, note: "ไม่มีสิทธิ์เข้าถึง" }
    }
  },
  {
    id: "users",
    module: "7. จัดการผู้ใช้งานและสิทธิ์ (User & Access Control)",
    icon: KeyRound,
    color: "text-red-600 bg-red-50 border-red-200",
    description: "จัดการบัญชีผู้ใช้งาน, รหัสผ่าน, ผูกบัญชีพนักงาน, กำหนดกลุ่มสิทธิ์ (Roles) และตาราง Matrix สิทธิ์",
    roles: {
      admin: { view: true, edit: true, delete: true, approve: true, export: true, note: "กำหนดสิทธิ์ สร้าง/ระงับบัญชีผู้ใช้งาน และรีเซ็ตรหัสผ่าน" },
      executive: { view: true, edit: false, delete: false, approve: false, export: false, note: "ดูรายชื่อผู้ใช้งานและตารางสิทธิ์การใช้งาน" },
      hr: { view: true, edit: false, delete: false, approve: false, export: false, note: "ดูรายชื่อผู้ใช้งานระบบ" },
      employee: { view: false, edit: false, delete: false, approve: false, export: false, note: "ไม่มีสิทธิ์เข้าถึง" }
    }
  },
  {
    id: "departments",
    module: "8. กลุ่มงานและโครงสร้างหน่วยงาน (Departments)",
    icon: Building2,
    color: "text-cyan-600 bg-cyan-50 border-cyan-200",
    description: "เพิ่ม ลบ แก้ไข รายชื่อกลุ่มงาน/หน่วยงานภายในโรงพยาบาลสามโคก",
    roles: {
      admin: { view: true, edit: true, delete: true, approve: true, export: true, note: "จัดการโครงสร้างกลุ่มงานทั้งหมด" },
      executive: { view: true, edit: false, delete: false, approve: false, export: false, note: "ดูรายชื่อกลุ่มงาน" },
      hr: { view: true, edit: true, delete: false, approve: false, export: false, note: "เพิ่มและแก้ไขชื่อกลุ่มงาน" },
      employee: { view: false, edit: false, delete: false, approve: false, export: false, note: "ไม่มีสิทธิ์เข้าถึง" }
    }
  },
  {
    id: "employee_types",
    module: "9. ประเภทการจ้างงาน (Employee Types)",
    icon: UserCheck,
    color: "text-teal-600 bg-teal-50 border-teal-200",
    description: "ข้าราชการ, ลูกจ้างประจำ, พนักงานราชการ, พนักงานกระทรวงฯ, ลูกจ้างชั่วคราว/รายวัน",
    roles: {
      admin: { view: true, edit: true, delete: true, approve: true, export: true, note: "จัดการประเภทการจ้างงานทั้งหมด" },
      executive: { view: true, edit: false, delete: false, approve: false, export: false, note: "ดูรายการประเภทบุคลากร" },
      hr: { view: true, edit: true, delete: false, approve: false, export: false, note: "เพิ่ม/แก้ไขประเภทบุคลากร" },
      employee: { view: false, edit: false, delete: false, approve: false, export: false, note: "ไม่มีสิทธิ์เข้าถึง" }
    }
  },
  {
    id: "positions",
    module: "10. สายงานและตำแหน่ง (Positions)",
    icon: Shield,
    color: "text-sky-600 bg-sky-50 border-sky-200",
    description: "กำหนดชื่อตำแหน่งวิชาชีพและสายงานทางการแพทย์และสนับสนุน",
    roles: {
      admin: { view: true, edit: true, delete: true, approve: true, export: true, note: "จัดการตำแหน่งงานทั้งหมด" },
      executive: { view: true, edit: false, delete: false, approve: false, export: false, note: "ดูรายการตำแหน่งงาน" },
      hr: { view: true, edit: true, delete: false, approve: false, export: false, note: "เพิ่มและแก้ไขตำแหน่งงาน" },
      employee: { view: false, edit: false, delete: false, approve: false, export: false, note: "ไม่มีสิทธิ์เข้าถึง" }
    }
  },
  {
    id: "pay_items",
    module: "11. รายการรับ-จ่าย & สูตรคำนวณ (Pay Items & Formulas)",
    icon: DollarSign,
    color: "text-amber-600 bg-amber-50 border-amber-200",
    description: "ตั้งค่ารายการได้-หัก (เงินเดือน, ค่าเวร, OT, พ.ต.ส., ภาษี, ประกันสังคม) และสูตรอัตโนมัติ",
    roles: {
      admin: { view: true, edit: true, delete: true, approve: true, export: true, note: "กำหนดสูตรคำนวณและรายการได้-หักทุกประเภท" },
      executive: { view: true, edit: false, delete: false, approve: false, export: false, note: "ดูรายการรับ-หักในระบบ" },
      hr: { view: true, edit: true, delete: false, approve: false, export: false, note: "ปรับแต่งสูตรและเพิ่มรายการรับ-หัก" },
      employee: { view: false, edit: false, delete: false, approve: false, export: false, note: "ไม่มีสิทธิ์เข้าถึง" }
    }
  },
  {
    id: "settings",
    module: "12. ตั้งค่าโรงพยาบาล & 50 ทวิ (Hospital Master Settings)",
    icon: Settings,
    color: "text-slate-600 bg-slate-50 border-slate-200",
    description: "ชื่อ รพ., เลขประจำตัวผู้เสียภาษี 13 หลัก, ที่อยู่ทางการ, ผู้มีอำนาจลงนาม, โลโก้ และลายเซ็นดิจิทัล",
    roles: {
      admin: { view: true, edit: true, delete: true, approve: true, export: true, note: "แก้ไขข้อมูลหน่วยงานสำหรับ 50 ทวิ, โลโก้ และลายเซ็น" },
      executive: { view: true, edit: false, delete: false, approve: false, export: false, note: "ดูข้อมูลการตั้งค่าโรงพยาบาล" },
      hr: { view: true, edit: true, delete: false, approve: false, export: false, note: "ตรวจสอบข้อมูลนิติบุคคลและผู้มีอำนาจลงนาม" },
      employee: { view: false, edit: false, delete: false, approve: false, export: false, note: "ไม่มีสิทธิ์เข้าถึง" }
    }
  }
];

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'matrix'>('users');
  
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // Filters for User List
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLinkStatus, setFilterLinkStatus] = useState("ALL");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterActive, setFilterActive] = useState("ALL");

  // Filters for Capabilities Matrix
  const [matrixSearch, setMatrixSearch] = useState("");
  const [matrixRoleFilter, setMatrixRoleFilter] = useState("ALL");

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: "username", direction: "asc" });
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    isActive: true,
    employeeId: "",
    roleIds: [] as string[]
  });
  
  const [empComboboxOpen, setEmpComboboxOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const [usersRes, rolesRes, empRes] = await Promise.all([
        axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/users/roles`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/employees`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setEmployees(empRes.data);
    } catch (err: any) {
      toast.error("ไม่สามารถดึงข้อมูลได้: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddDialog = () => {
    setFormData({
      username: "",
      password: "",
      email: "",
      isActive: true,
      employeeId: "",
      roleIds: []
    });
    setIsAddOpen(true);
  };

  const openEditDialog = (user: any) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      password: "", // blank for edit
      email: user.email || "",
      isActive: user.isActive,
      employeeId: user.employeeId || "",
      roleIds: user.roles?.map((r: any) => r.roleId) || []
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (user: any) => {
    setCurrentUser(user);
    setIsDeleteOpen(true);
  };

  const toggleRole = (roleId: string) => {
    setFormData(prev => {
      if (prev.roleIds.includes(roleId)) {
        return { ...prev, roleIds: prev.roleIds.filter(id => id !== roleId) };
      } else {
        return { ...prev, roleIds: [...prev.roleIds, roleId] };
      }
    });
  };

  const handleSave = async (isEdit: boolean) => {
    if (!formData.username) return toast.error("กรุณากรอกชื่อผู้ใช้งาน (Username)");
    if (!isEdit && !formData.password) return toast.error("กรุณากรอกรหัสผ่าน");
    if (!isEdit && formData.password.length < 6) return toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
    
    setSaving(true);
    const toastId = toast.loading("กำลังบันทึกข้อมูล...");
    try {
      const token = Cookies.get("token");
      const payload: any = {
        username: formData.username,
        isActive: formData.isActive,
        roles: formData.roleIds
      };
      if (formData.email) payload.email = formData.email;
      if (formData.employeeId) payload.employeeId = formData.employeeId;
      if (formData.password) payload.password = formData.password;
      
      if (isEdit) {
        await axios.patch(`${API_URL}/users/${currentUser.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_URL}/users`, payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      toast.success("บันทึกข้อมูลสำเร็จ", { id: toastId });
      setIsAddOpen(false);
      setIsEditOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาด", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'signature') => {
    if (!e.target.files || !e.target.files[0]) return;
    if (!currentUser) return toast.error("กรุณาบันทึกข้อมูลผู้ใช้งานก่อนอัปโหลดรูป");

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    const toastId = toast.loading(`กำลังอัปโหลด${type === 'image' ? 'รูปโปรไฟล์' : 'ลายเซ็น'}...`);
    try {
      const token = Cookies.get("token");
      await axios.post(`${API_URL}/users/${currentUser.id}/upload-${type}`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success("อัปโหลดสำเร็จ", { id: toastId });
      fetchData();
      
      const res = await axios.get(`${API_URL}/users/${currentUser.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCurrentUser(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการอัปโหลด", { id: toastId });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (type: 'image' | 'signature') => {
    if (!currentUser) return;
    if (!confirm(`คุณต้องการลบ${type === 'image' ? 'รูปโปรไฟล์' : 'ลายเซ็น'}ใช่หรือไม่?`)) return;

    setUploading(true);
    const toastId = toast.loading(`กำลังลบ${type === 'image' ? 'รูปโปรไฟล์' : 'ลายเซ็น'}...`);
    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_URL}/users/${currentUser.id}/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("ลบสำเร็จ", { id: toastId });
      fetchData();
      
      const res = await axios.get(`${API_URL}/users/${currentUser.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCurrentUser(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการลบ", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    const toastId = toast.loading("กำลังลบข้อมูล...");
    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_URL}/users/${currentUser.id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("ลบข้อมูลสำเร็จ", { id: toastId });
      setIsDeleteOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error("เกิดข้อผิดพลาดในการลบ", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const requestSort = (key: string) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter & Sort Logic for Users
  let processedUsers = [...users];
  if (filterLinkStatus !== "ALL") {
    processedUsers = processedUsers.filter(u => filterLinkStatus === "LINKED" ? u.employeeId : !u.employeeId);
  }
  if (filterRole !== "ALL") {
    processedUsers = processedUsers.filter(u => u.roles?.some((r: any) => r.roleId === filterRole));
  }
  if (filterActive !== "ALL") {
    processedUsers = processedUsers.filter(u => filterActive === "ACTIVE" ? u.isActive : !u.isActive);
  }
  if (searchTerm) {
    const s = searchTerm.toLowerCase();
    processedUsers = processedUsers.filter(u => 
      u.username.toLowerCase().includes(s) ||
      (u.employee?.firstName || "").toLowerCase().includes(s) ||
      (u.employee?.employeeCode || "").toLowerCase().includes(s)
    );
  }

  processedUsers.sort((a, b) => {
    let valA = "";
    let valB = "";

    if (sortConfig.key === "username") {
      valA = a.username.toLowerCase();
      valB = b.username.toLowerCase();
    } else if (sortConfig.key === "employee") {
      valA = a.employee ? `${a.employee.employeeCode} ${a.employee.firstName}`.toLowerCase() : "";
      valB = b.employee ? `${b.employee.employeeCode} ${b.employee.firstName}`.toLowerCase() : "";
    } else if (sortConfig.key === "roles") {
      valA = a.roles?.[0]?.role?.name?.toLowerCase() || "";
      valB = b.roles?.[0]?.role?.name?.toLowerCase() || "";
    } else if (sortConfig.key === "status") {
      valA = a.isActive ? "1" : "0";
      valB = b.isActive ? "1" : "0";
    }

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Filter Matrix capabilities
  const filteredCapabilities = SYSTEM_CAPABILITIES.filter(item => {
    const s = matrixSearch.toLowerCase();
    const matchSearch = !matrixSearch || item.module.toLowerCase().includes(s) || item.description.toLowerCase().includes(s);
    return matchSearch;
  });

  // Render Action Badges for Matrix
  const renderRolePermissions = (rolePerm: any) => {
    if (!rolePerm.view && !rolePerm.edit && !rolePerm.delete && !rolePerm.approve && !rolePerm.export) {
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
            <Lock className="w-3 h-3 text-gray-400" /> ไม่อนุญาต
          </span>
          <span className="text-[10px] text-gray-400 italic">{rolePerm.note}</span>
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-1">
          {rolePerm.view && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200" title="ดูข้อมูล">
              ✓ ดูข้อมูล
            </span>
          )}
          {rolePerm.edit && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200" title="เพิ่ม/แก้ไข">
              ✓ สร้าง/แก้
            </span>
          )}
          {rolePerm.delete && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200" title="ลบข้อมูล">
              ✓ ลบ
            </span>
          )}
          {rolePerm.approve && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200" title="อนุมัติ">
              ✓ อนุมัติ
            </span>
          )}
          {rolePerm.export && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200" title="พิมพ์/ส่งออก">
              ✓ พิมพ์/ออก
            </span>
          )}
        </div>
        <p className="text-[10.5px] text-gray-600 leading-tight">{rolePerm.note}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <KeyRound className="w-7 h-7 text-indigo-600" /> จัดการผู้ใช้งานและกำหนดสิทธิ์ (RBAC & Permissions)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ตั้งค่าบัญชีผู้ใช้งาน ผูกประวัติบุคลากร และตรวจสอบตารางสิทธิ์การเข้าถึง 12 โมดูลระบบ
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-200/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'users' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            1. บัญชีผู้ใช้งาน ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'matrix' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            2. ตารางสิทธิ์โมดูล (Matrix)
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USERS MANAGEMENT TABLE */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <Card className="bg-white shadow-sm border-gray-200">
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="ค้นหาชื่อผู้ใช้ / รหัสพนักงาน..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold whitespace-nowrap">การผูกบัญชี:</Label>
                <select className="h-9 border rounded px-2 text-xs bg-gray-50 cursor-pointer" value={filterLinkStatus} onChange={e => setFilterLinkStatus(e.target.value)}>
                  <option value="ALL">ทั้งหมด (All)</option>
                  <option value="LINKED">ผูกพนักงานแล้ว</option>
                  <option value="UNLINKED">ไม่ได้ผูก</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold whitespace-nowrap">กลุ่มผู้ใช้งาน:</Label>
                <select className="h-9 border rounded px-2 text-xs bg-gray-50 cursor-pointer" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                  <option value="ALL">ทั้งหมด (All)</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold whitespace-nowrap">สถานะ:</Label>
                <select className="h-9 border rounded px-2 text-xs bg-gray-50 cursor-pointer" value={filterActive} onChange={e => setFilterActive(e.target.value)}>
                  <option value="ALL">ทั้งหมด (All)</option>
                  <option value="ACTIVE">เปิดใช้งาน</option>
                  <option value="INACTIVE">ระงับ</option>
                </select>
              </div>
            </div>

            <Button className="bg-[#1877f2] hover:bg-[#166fe5] h-9 text-xs" onClick={openAddDialog}>
              <Plus className="mr-1.5 h-4 w-4" /> เพิ่มผู้ใช้งานใหม่
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">ลำดับ</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("username")} className="font-bold p-0 h-auto hover:bg-transparent text-xs">
                    ชื่อผู้ใช้งาน (Username) <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("employee")} className="font-bold p-0 h-auto hover:bg-transparent text-xs">
                    ผูกกับพนักงาน <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("roles")} className="font-bold p-0 h-auto hover:bg-transparent text-xs">
                    กลุ่มผู้ใช้งาน (Roles) <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button variant="ghost" onClick={() => requestSort("status")} className="font-bold p-0 h-auto hover:bg-transparent text-xs">
                    สถานะ <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-[120px] text-center">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500 text-xs">กำลังโหลดข้อมูล...</TableCell>
                </TableRow>
              ) : processedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500 text-xs">ไม่พบข้อมูลผู้ใช้งาน</TableCell>
                </TableRow>
              ) : (
                processedUsers.map((user, idx) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-center text-gray-500 text-xs">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-xs">
                      <div className="flex items-center gap-2">
                        {user.imgUrl ? (
                          <img src={user.imgUrl} alt="" className="w-7 h-7 rounded-full object-cover border" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 border">
                            {user.username.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span>{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.employee ? (
                        <div className="text-xs">
                          <span className="font-semibold text-blue-700">{user.employee.employeeCode}</span>
                          <span className="ml-1.5 text-gray-700">{user.employee.firstName} {user.employee.lastName}</span>
                          {user.employee.department?.name && (
                            <span className="text-[11px] text-gray-400 block mt-0.5">({user.employee.department.name})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">ไม่ได้ผูก (แอดมินอิสระ)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((r: any) => (
                          <span key={r.roleId} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {r.role.name}
                          </span>
                        ))}
                        {(!user.roles || user.roles.length === 0) && <span className="text-gray-400 text-xs">-</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {user.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800">
                          เปิดใช้งาน
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-800">
                          ระงับ
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 bg-blue-50 hover:bg-blue-100" onClick={() => openEditDialog(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 bg-red-50 hover:bg-red-100" onClick={() => openDeleteDialog(user)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PERMISSIONS & CAPABILITIES MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Summary Cards for 4 Core Roles */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-red-500 bg-white shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    System Administrator
                  </span>
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">ผู้ดูแลระบบสูงสุด</h4>
                <p className="text-xs text-gray-500 mt-1">
                  สิทธิ์เต็ม 100% ทุกโมดูล ไม่จำเป็นต้องเป็นพนักงาน จัดการสิทธิ์ โครงสร้าง และตั้งค่าระบบ
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-white shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Executive
                  </span>
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">ผู้บริหาร / ผอ.</h4>
                <p className="text-xs text-gray-500 mt-1">
                  เข้าถึงแดชบอร์ดหลายมิติ, เจาะลึกรายงาน, อนุมัติ/ส่งกลับรอบเงินเดือน, สลิปและ 50 ทวิของตนเอง
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 bg-white shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    HR & Finance Officer
                  </span>
                  <DollarSign className="w-5 h-5 text-blue-500" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">การเงิน & ทรัพยากรบุคคล</h4>
                <p className="text-xs text-gray-500 mt-1">
                  คำนวณเงินเดือน, จัดการประวัติพนักงาน, ออกรายงานส่งสรรพากร/ธนาคาร, ออก 50 ทวิ
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 bg-white shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Employee / Staff
                  </span>
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">บุคลากรทั่วไป</h4>
                <p className="text-xs text-gray-500 mt-1">
                  เข้าถึงสลิปของฉัน เรียกดูสลิปย้อนหลัง พิมพ์สลิป และพิมพ์หนังสือรับรองภาษี 50 ทวิของตนเอง
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Capabilities Matrix Table */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader className="border-b pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" /> ตารางเมทริกซ์สิทธิ์การใช้งาน 12 โมดูลระบบ (Capabilities Matrix)
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500 mt-0.5">
                    แผนผังการกำหนดสิทธิ์ (RBAC) แสดงความสามารถในการ ดู, เพิ่ม/แก้ไข, ลบ, อนุมัติ และพิมพ์/ส่งออก
                  </CardDescription>
                </div>

                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="ค้นหาโมดูล / ความสามารถ..." 
                    value={matrixSearch}
                    onChange={(e) => setMatrixSearch(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[30%] min-w-[240px]">โมดูล / ความสามารถของระบบ</TableHead>
                    <TableHead className="w-[17%] min-w-[150px] text-red-700 font-bold">1. ผู้ดูแลระบบ (Admin)</TableHead>
                    <TableHead className="w-[17%] min-w-[150px] text-purple-700 font-bold">2. ผู้บริหาร (Executive)</TableHead>
                    <TableHead className="w-[18%] min-w-[160px] text-blue-700 font-bold">3. การเงิน/บุคคล (HR)</TableHead>
                    <TableHead className="w-[18%] min-w-[160px] text-emerald-700 font-bold">4. พนักงานทั่วไป (Staff)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCapabilities.map((item) => {
                    const Icon = item.icon;
                    return (
                      <TableRow key={item.id} className="hover:bg-gray-50/60">
                        {/* Module Info */}
                        <TableCell className="align-top py-3">
                          <div className="flex items-start gap-2.5">
                            <div className={`p-2 rounded-lg border ${item.color} shrink-0 mt-0.5`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-gray-900">{item.module}</h4>
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Admin Role */}
                        <TableCell className="align-top py-3">
                          {renderRolePermissions(item.roles.admin)}
                        </TableCell>

                        {/* Executive Role */}
                        <TableCell className="align-top py-3">
                          {renderRolePermissions(item.roles.executive)}
                        </TableCell>

                        {/* HR Role */}
                        <TableCell className="align-top py-3">
                          {renderRolePermissions(item.roles.hr)}
                        </TableCell>

                        {/* Employee Role */}
                        <TableCell className="align-top py-3">
                          {renderRolePermissions(item.roles.employee)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) { setIsAddOpen(false); setIsEditOpen(false); }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? "แก้ไขข้อมูลผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs">Username <span className="text-red-500">*</span></Label>
              <Input className="col-span-3 text-xs" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="สำหรับล็อกอิน" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs">Password {isAddOpen && <span className="text-red-500">*</span>}</Label>
              <Input className="col-span-3 text-xs" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={isEditOpen ? "(ปล่อยว่างถ้าไม่ต้องการเปลี่ยน)" : "รหัสผ่าน"} />
            </div>
            
            {isEditOpen && currentUser && (
              <>
                <hr className="my-2" />
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-xs">รูปโปรไฟล์</Label>
                  <div className="col-span-3 flex items-center gap-4">
                    {currentUser.imgUrl && (
                      <div className="relative group">
                        <img src={currentUser.imgUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover border" />
                        <button onClick={() => handleDeleteImage('image')} disabled={uploading} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="ลบรูปโปรไฟล์">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image')} disabled={uploading} className="text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-xs">ลายเซ็น</Label>
                  <div className="col-span-3 flex items-center gap-4">
                    {currentUser.signatureUrl && (
                      <div className="relative group">
                        <img src={currentUser.signatureUrl} alt="Signature" className="h-12 object-contain border bg-white p-1" />
                        <button onClick={() => handleDeleteImage('signature')} disabled={uploading} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="ลบลายเซ็น">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'signature')} disabled={uploading} className="text-xs" />
                  </div>
                </div>
              </>
            )}

            <hr className="my-2" />
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs">ผูกกับพนักงาน</Label>
              <div className="col-span-3">
                <Popover open={empComboboxOpen} onOpenChange={setEmpComboboxOpen}>
                  <PopoverTrigger role="combobox" aria-expanded={empComboboxOpen} className={buttonVariants({ variant: "outline", className: "w-full justify-between font-normal bg-white text-xs" })}>
                      {formData.employeeId ? (
                        (() => {
                          const e = employees.find(emp => emp.id === formData.employeeId);
                          return e ? `${e.employeeCode} - ${e.firstName} ${e.lastName}` : "เลือกพนักงาน...";
                        })()
                      ) : "เลือกพนักงาน (หรือเว้นว่างสำหรับ Admin)..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="w-[340px] p-0" style={{ zIndex: 99999 }}>
                    <Command>
                      <CommandInput placeholder="ค้นหารหัส หรือชื่อพนักงาน..." className="text-xs" />
                      <CommandList>
                        <CommandEmpty>ไม่พบพนักงาน</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="none"
                            onSelect={() => {
                              setFormData({...formData, employeeId: ""});
                              setEmpComboboxOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", !formData.employeeId ? "opacity-100" : "opacity-0")} />
                            <span className="italic text-gray-500 text-xs">-- ไม่ผูกกับพนักงาน (None / Admin) --</span>
                          </CommandItem>
                          {employees.map(emp => (
                            <CommandItem
                              key={emp.id}
                              value={`${emp.employeeCode} ${emp.firstName} ${emp.lastName}`}
                              onSelect={() => {
                                setFormData({...formData, employeeId: emp.id});
                                setEmpComboboxOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", formData.employeeId === emp.id ? "opacity-100" : "opacity-0")} />
                              <span className="font-medium mr-2 text-blue-600 text-xs">{emp.employeeCode}</span>
                              <span className="text-xs">{emp.firstName} {emp.lastName}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right text-xs mt-2">กลุ่มผู้ใช้งาน</Label>
              <div className="col-span-3 space-y-2 border rounded-md p-3 bg-gray-50">
                {roles.map(role => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id={`role-${role.id}`}
                      checked={formData.roleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor={`role-${role.id}`} className="text-xs font-medium leading-none cursor-pointer">
                      {role.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs">สถานะ</Label>
              <div className="col-span-3 flex items-center space-x-2">
                 <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-xs cursor-pointer">
                    เปิดใช้งาน
                  </label>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>ยกเลิก</Button>
            <Button size="sm" className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={() => handleSave(isEditOpen)} disabled={saving}>
              {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-xs">คุณต้องการลบผู้ใช้งาน <strong>{currentUser?.username}</strong> ใช่หรือไม่?</p>
            <p className="text-xs text-red-500 mt-2">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>ยกเลิก</Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={saving}>
              {saving ? "กำลังลบ..." : "ยืนยันการลบ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
