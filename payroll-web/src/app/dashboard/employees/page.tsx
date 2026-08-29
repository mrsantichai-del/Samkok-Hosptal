"use client";
import { API_URL } from "@/lib/config";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeTypes, setEmployeeTypes] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idCard, setIdCard] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeTypeId, setEmployeeTypeId] = useState("unassigned");
  const [positionId, setPositionId] = useState("unassigned");
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPositionId, setFilterPositionId] = useState("all");
  const [filterTypeId, setFilterTypeId] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Combobox Open States
  const [openPos, setOpenPos] = useState(false);
  const [openType, setOpenType] = useState(false);

  // Derived filtered list
  const filteredEmployees = employees.filter(emp => {
    const matchSearch = emp.firstName.includes(searchTerm) || emp.lastName.includes(searchTerm) || emp.employeeCode.includes(searchTerm);
    const matchPos = filterPositionId === "all" || emp.positionId === filterPositionId;
    const matchType = filterTypeId === "all" || emp.employeeTypeId === filterTypeId;
    const matchStatus = filterStatus === "all" || (filterStatus === "active" ? !emp.resignedDate : !!emp.resignedDate);
    return matchSearch && matchPos && matchType && matchStatus;
  });

  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const [empRes, typeRes, posRes] = await Promise.all([
        axios.get(`${API_URL}/employees`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/employees/types`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/employees/positions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setEmployees(empRes.data);
      setEmployeeTypes(typeRes.data);
      setPositions(posRes.data);
    } catch (e) {
      console.error(e);
      toast.error("ดึงข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openAddDialog = () => {
    setEditingItem(null);
    setEmployeeCode("");
    setFirstName("");
    setLastName("");
    setIdCard("");
    setEmployeeTypeId("unassigned");
    setPositionId("unassigned");
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setEmployeeCode(item.employeeCode || "");
    setFirstName(item.firstName);
    setLastName(item.lastName);
    setIdCard(item.idCard || "");
    setEmployeeTypeId(item.employeeTypeId || "unassigned");
    setPositionId(item.positionId || "unassigned");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = Cookies.get("token");
      const payload = {
        firstName,
        lastName,
        idCard: idCard || undefined,
        employeeTypeId: employeeTypeId === "unassigned" ? null : employeeTypeId,
        positionId: positionId === "unassigned" ? null : positionId
      };

      if (editingItem) {
        await axios.patch(`${API_URL}/employees/${editingItem.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/employees`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsDialogOpen(false);
      fetchEmployees();
    } catch (e: any) {
      toast.error();
    } finally {
      setSaving(false);
    }
  };

    const promptDelete = (item: any) => {
    setDeleteItem(item);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    setSaving(true);
    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_URL}/employees/${deleteItem.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteItem(null);
      fetchEmployees();
      toast.success("ลบข้อมูลสำเร็จ");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการลบ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">ข้อมูลพนักงาน</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการรายชื่อพนักงานทั้งหมด</p>
        </div>
        <Button className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> เพิ่มพนักงานใหม่
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 bg-white border-b flex items-center justify-between">
          <div className="flex gap-4 flex-wrap">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="ค้นหารหัส/ชื่อพนักงาน..." 
                className="pl-9 bg-[#f0f2f5] border-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">ตำแหน่ง:</Label>
              <select className="h-9 border rounded px-2 text-sm bg-gray-50" value={filterPositionId} onChange={e => setFilterPositionId(e.target.value)}>
                 <option value="all">ทั้งหมด (All)</option>
                 {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">ประเภท:</Label>
              <select className="h-9 border rounded px-2 text-sm bg-gray-50" value={filterTypeId} onChange={e => setFilterTypeId(e.target.value)}>
                 <option value="all">ทั้งหมด (All)</option>
                 {employeeTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">สถานะ:</Label>
              <select className="h-9 border rounded px-2 text-sm bg-gray-50" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                 <option value="all">ทั้งหมด (All)</option>
                 <option value="active">ทำงาน</option>
                 <option value="resigned">ลาออก</option>
              </select>
            </div>
          </div>
        </div>
        <Table className="bg-white">
          <TableHeader>
            <TableRow>
              <TableHead>รหัสพนักงาน</TableHead>
              <TableHead>ชื่อ - นามสกุล</TableHead>
              <TableHead>ตำแหน่ง</TableHead>
                <TableHead>ประเภทพนักงาน</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-[120px]">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                  กำลังโหลดข้อมูล...
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                  ไม่พบข้อมูลพนักงาน
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.employeeCode}</TableCell>
                  <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                  <TableCell className="text-gray-600">
                    {emp.position?.name || "-"}
                  </TableCell>
                  <TableCell>
                    {emp.employeeType?.name ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {emp.employeeType.name}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    {emp.resignedDate ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ลาออก
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ทำงาน
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => openEditDialog(emp)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(emp.id)}>
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

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employeeCode">รหัสพนักงาน</Label>
              <Input id="employeeCode" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} placeholder="ถ้าปล่อยว่างระบบจะสร้างให้ (EMP-xxxxxx)" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">ชื่อ</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="ชื่อ" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">นามสกุล</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="นามสกุล" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="idCard">เลขบัตรประชาชน (ไม่บังคับ)</Label>
              <Input id="idCard" value={idCard} onChange={(e) => setIdCard(e.target.value)} placeholder="เลข 13 หลัก" />
            </div>

            <div className="space-y-2">
              <Label>ตำแหน่ง</Label>
              <Popover open={openPos} onOpenChange={setOpenPos}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={openPos} className="w-full justify-between">
                    {positionId === "unassigned" ? "ไม่ระบุ" : positions.find(p => p.id === positionId)?.name || "เลือกตำแหน่ง..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[380px] p-0" style={{ zIndex: 99999 }}>
                  <Command>
                    <CommandInput placeholder="ค้นหาตำแหน่ง..." />
                    <CommandEmpty>ไม่พบตำแหน่ง</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        <CommandItem onSelect={() => { setPositionId("unassigned"); setOpenPos(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", positionId === "unassigned" ? "opacity-100" : "opacity-0")} />
                          ไม่ระบุ
                        </CommandItem>
                        {positions.map(pos => (
                          <CommandItem key={pos.id} onSelect={() => { setPositionId(pos.id); setOpenPos(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", positionId === pos.id ? "opacity-100" : "opacity-0")} />
                            {pos.name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>ประเภทพนักงาน</Label>
              <Popover open={openType} onOpenChange={setOpenType}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={openType} className="w-full justify-between">
                    {employeeTypeId === "unassigned" ? "ไม่ระบุ" : employeeTypes.find(t => t.id === employeeTypeId)?.name || "เลือกประเภท..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[380px] p-0" style={{ zIndex: 99999 }}>
                  <Command>
                    <CommandInput placeholder="ค้นหาประเภทพนักงาน..." />
                    <CommandEmpty>ไม่พบประเภทพนักงาน</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        <CommandItem onSelect={() => { setEmployeeTypeId("unassigned"); setOpenType(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", employeeTypeId === "unassigned" ? "opacity-100" : "opacity-0")} />
                          ไม่ระบุ
                        </CommandItem>
                        {employeeTypes.map(type => (
                          <CommandItem key={type.id} onSelect={() => { setEmployeeTypeId(type.id); setOpenType(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", employeeTypeId === type.id ? "opacity-100" : "opacity-0")} />
                            {type.name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
            <Button className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={handleSave} disabled={saving || !firstName || !lastName}>
              {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">ยืนยันการลบข้อมูล</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-gray-600">
            คุณแน่ใจหรือไม่ที่จะลบ <span className="font-bold text-gray-900">{deleteItem?.employeeCode}</span>?<br/>
            การกระทำนี้ไม่สามารถย้อนกลับได้
          </div>
          <DialogFooter className="sm:justify-between flex-row">
            <Button variant="outline" onClick={() => setDeleteItem(null)}>ยกเลิก</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete} disabled={saving}>
              {saving ? "กำลังลบ..." : "ยืนยันการลบ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
