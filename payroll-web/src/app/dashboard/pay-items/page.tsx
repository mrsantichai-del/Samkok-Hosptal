"use client";
import { API_URL } from "@/lib/config";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function PayItemsPage() {
  const [payItems, setPayItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState("INCOME");
  const [formula, setFormula] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPayItems = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_URL}/pay-items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayItems(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayItems();
  }, []);

  const openAddDialog = () => {
    setEditingItem(null);
    setName("");
    setType("INCOME");
    setFormula("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setType(item.type);
    setFormula(item.defaultFormula || "");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = Cookies.get("token");
      const payload = {
        name,
        type,
        defaultFormula: formula === "" ? null : formula
      };

      if (editingItem) {
        await axios.patch(`${API_URL}/pay-items/${editingItem.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/pay-items`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsDialogOpen(false);
      fetchPayItems();
    } catch (e: any) {
      toast.error();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบรายการนี้?")) return;
    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_URL}/pay-items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPayItems();
    } catch (e: any) {
      toast.error();
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">ตั้งค่า รายรับ-รายจ่าย</h1>
          <p className="text-gray-500 text-sm mt-1">กำหนดประเภทเงินได้ เงินหัก และสูตรการคำนวณเบื้องต้น</p>
        </div>
        <Button className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> เพิ่มรายการใหม่
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 bg-white border-b flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input placeholder="ค้นหารายการ..." className="pl-9 bg-[#f0f2f5] border-none" />
          </div>
        </div>
        <Table className="bg-white">
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อรายการ</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>สูตรคำนวณ (Default)</TableHead>
              <TableHead className="w-[100px]">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</TableCell></TableRow>
            ) : payItems.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-gray-500">ไม่พบข้อมูลรายการตั้งค่า</TableCell></TableRow>
            ) : (
              payItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.type === 'INCOME' ? 'รายรับ (+)' : 'รายจ่าย (-)'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-600">
                      {item.defaultFormula || "กรอกด้วยตนเอง (Manual)"}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => openEditDialog(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
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
            <DialogTitle>{editingItem ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อรายการ</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น ค่าเวร, ประกันสังคม" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">ประเภท</Label>
              <Select value={type} onValueChange={(val) => setType(val as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">รายรับ (+)</SelectItem>
                  <SelectItem value="DEDUCTION">รายจ่าย (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="formula">สูตรคำนวณ (ไม่บังคับ)</Label>
              <Input id="formula" value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="เช่น BaseSalary * 0.05 หรือเว้นว่างไว้" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
            <Button className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={handleSave} disabled={saving || !name}>
              {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
