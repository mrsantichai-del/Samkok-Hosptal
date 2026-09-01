"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, Check, ChevronsUpDown, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/config";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLinkStatus, setFilterLinkStatus] = useState("ALL");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterActive, setFilterActive] = useState("ALL");

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
      fetchData(); // Refresh to get new image URL
      
      // Update currentUser to reflect immediately
      const res = await axios.get(`${API_URL}/users/${currentUser.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCurrentUser(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการอัปโหลด", { id: toastId });
    } finally {
      setUploading(false);
      e.target.value = ''; // reset
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
      fetchData(); // Refresh list
      
      // Update currentUser to reflect immediately
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

  // Handle Sort
  const requestSort = (key: string) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter & Sort Logic
  let processedUsers = [...users];

  // Apply Filters
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

  // Apply Sort
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">จัดการผู้ใช้งาน (Users)</h1>
          <p className="text-sm text-gray-500 mt-1">ตั้งค่าบัญชีผู้ใช้งาน สิทธิ์การเข้าถึง และผูกข้อมูลพนักงาน</p>
        </div>
      </div>

      <Card className="bg-white shadow-sm border-gray-200">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="ค้นหาชื่อผู้ใช้ / รหัสพนักงาน..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">การผูกบัญชี:</Label>
              <select className="h-9 border rounded px-2 text-sm bg-gray-50" value={filterLinkStatus} onChange={e => setFilterLinkStatus(e.target.value)}>
                <option value="ALL">ทั้งหมด (All)</option>
                <option value="LINKED">ผูกพนักงานแล้ว</option>
                <option value="UNLINKED">ไม่ได้ผูก</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">กลุ่มผู้ใช้งาน:</Label>
              <select className="h-9 border rounded px-2 text-sm bg-gray-50" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                <option value="ALL">ทั้งหมด (All)</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">สถานะ:</Label>
              <select className="h-9 border rounded px-2 text-sm bg-gray-50" value={filterActive} onChange={e => setFilterActive(e.target.value)}>
                <option value="ALL">ทั้งหมด (All)</option>
                <option value="ACTIVE">เปิดใช้งาน</option>
                <option value="INACTIVE">ระงับ</option>
              </select>
            </div>

          </div>

          <Button className="bg-[#1877f2] hover:bg-[#166fe5] h-9" onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> เพิ่มผู้ใช้งานใหม่
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">ลำดับ</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("username")} className="font-bold p-0 h-auto hover:bg-transparent">
                  ชื่อผู้ใช้งาน <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("employee")} className="font-bold p-0 h-auto hover:bg-transparent">
                  ผูกกับพนักงาน <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("roles")} className="font-bold p-0 h-auto hover:bg-transparent">
                  กลุ่มผู้ใช้งาน <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button variant="ghost" onClick={() => requestSort("status")} className="font-bold p-0 h-auto hover:bg-transparent">
                  สถานะ <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[120px]">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</TableCell>
              </TableRow>
            ) : processedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">ไม่พบข้อมูลผู้ใช้งาน</TableCell>
              </TableRow>
            ) : (
              processedUsers.map((user, idx) => (
                <TableRow key={user.id}>
                  <TableCell className="text-center text-gray-500">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    {user.employee ? (
                      <div className="text-sm">
                        <span className="font-medium text-blue-700">{user.employee.employeeCode}</span>
                        <span className="ml-2 text-gray-600">{user.employee.firstName} {user.employee.lastName}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">ไม่ได้ผูก</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles?.map((r: any) => (
                        <span key={r.roleId} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {r.role.name}
                        </span>
                      ))}
                      {(!user.roles || user.roles.length === 0) && <span className="text-gray-400">-</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {user.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        เปิดใช้งาน
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ระงับ
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100" onClick={() => openEditDialog(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100" onClick={() => openDeleteDialog(user)}>
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
              <Label className="text-right">Username <span className="text-red-500">*</span></Label>
              <Input className="col-span-3" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="สำหรับล็อกอิน" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Password {isAddOpen && <span className="text-red-500">*</span>}</Label>
              <Input className="col-span-3" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={isEditOpen ? "(ปล่อยว่างถ้าไม่ต้องการเปลี่ยน)" : "รหัสผ่าน"} />
            </div>
            
            
            {isEditOpen && currentUser && (
              <>
                <hr className="my-2" />
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">รูปโปรไฟล์</Label>
                  <div className="col-span-3 flex items-center gap-4">
                    {currentUser.imgUrl && (
                      
                      <div className="relative group">
                        <img src={currentUser.imgUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover border" />
                        <button onClick={() => handleDeleteImage('image')} disabled={uploading} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="ลบรูปโปรไฟล์">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image')} disabled={uploading} className="text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">ลายเซ็น</Label>
                  <div className="col-span-3 flex items-center gap-4">
                    {currentUser.signatureUrl && (
                      
                      <div className="relative group">
                        <img src={currentUser.signatureUrl} alt="Signature" className="h-12 object-contain border bg-white p-1" />
                        <button onClick={() => handleDeleteImage('signature')} disabled={uploading} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="ลบลายเซ็น">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'signature')} disabled={uploading} className="text-sm" />
                  </div>
                </div>
              </>
            )}

            <hr className="my-2" />
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">ผูกกับพนักงาน</Label>
              <div className="col-span-3">
                <Popover open={empComboboxOpen} onOpenChange={setEmpComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={empComboboxOpen} className="w-full justify-between font-normal bg-white">
                      {formData.employeeId ? (
                        (() => {
                          const e = employees.find(emp => emp.id === formData.employeeId);
                          return e ? `${e.employeeCode} - ${e.firstName} ${e.lastName}` : "เลือกพนักงาน...";
                        })()
                      ) : "เลือกพนักงาน (พิมพ์ค้นหาได้)..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[340px] p-0" style={{ zIndex: 99999 }}>
                    <Command>
                      <CommandInput placeholder="ค้นหารหัส หรือชื่อพนักงาน..." />
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
                            <span className="italic text-gray-500">-- ไม่ผูกกับพนักงาน (None) --</span>
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
                              <span className="font-medium mr-2 text-blue-600">{emp.employeeCode}</span>
                              {emp.firstName} {emp.lastName}
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
              <Label className="text-right mt-2">กลุ่มผู้ใช้งาน</Label>
              <div className="col-span-3 space-y-2 border rounded-md p-3 bg-gray-50">
                {roles.map(role => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id={`role-${role.id}`}
                      checked={formData.roleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`role-${role.id}`} className="text-sm font-medium leading-none cursor-pointer">
                      {role.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">สถานะ</Label>
              <div className="col-span-3 flex items-center space-x-2">
                 <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="isActive" className="text-sm cursor-pointer">
                    เปิดใช้งาน
                  </label>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>ยกเลิก</Button>
            <Button className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={() => handleSave(isEditOpen)} disabled={saving}>
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
            <p>คุณต้องการลบผู้ใช้งาน <strong>{currentUser?.username}</strong> ใช่หรือไม่?</p>
            <p className="text-sm text-red-500 mt-2">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>ยกเลิก</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={saving}>
              {saving ? "กำลังลบ..." : "ยืนยันการลบ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
