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
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  const [employeeTypeId, setEmployeeTypeId] = useState("unassigned");
  const [positionId, setPositionId] = useState("unassigned");
  const [saving, setSaving] = useState(false);

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
    setFirstName("");
    setLastName("");
    setIdCard("");
    setEmployeeTypeId("unassigned");
    setPositionId("unassigned");
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
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

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบพนักงานคนนี้? (ข้อมูลจะถูกย้ายไปถังขยะ)")) return;
    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_URL}/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEmployees();
    } catch (e: any) {
      toast.error();
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
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="ค้นหาชื่อพนักงาน..." 
              className="pl-9 bg-[#f0f2f5] border-none"
            />
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
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                  กำลังโหลดข้อมูล...
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                  ไม่พบข้อมูลพนักงาน
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.employeeCode}</TableCell>
                  <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                  <TableCell>
                    {emp.employeeType?.name ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {emp.employeeType.name}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ทำงาน
                    </span>
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
              <Select value={positionId} onValueChange={setPositionId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกตำแหน่ง" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">ไม่ระบุ</SelectItem>
                  {positions.map(pos => (
                    <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>ประเภทพนักงาน</Label>
              <Select value={employeeTypeId} onValueChange={setEmployeeTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทพนักงาน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">ไม่ระบุ</SelectItem>
                  {employeeTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
    </div>
  );
}
