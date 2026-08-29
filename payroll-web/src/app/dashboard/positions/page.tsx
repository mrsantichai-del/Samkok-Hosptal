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

export default function PositionsPage() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Filtering & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const filteredTypes = types.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    if (sortOrder === "asc") return a.name.localeCompare(b.name, 'th');
    return b.name.localeCompare(a.name, 'th');
  });


  const fetchTypes = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_URL}/employees/positions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTypes(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const openAddDialog = () => {
    setEditingItem(null);
    setName("");
    setDescription("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description || "");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = Cookies.get("token");
      const payload = {
        name,
        description: description === "" ? null : description
      };

      if (editingItem) {
        await axios.patch(`${API_URL}/employees/positions/${editingItem.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/employees/positions`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsDialogOpen(false);
      fetchTypes();
    } catch (e: any) {
      alert(e.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบตำแหน่งนี้?")) return;
    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_URL}/employees/positions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTypes();
    } catch (e: any) {
      alert(e.response?.data?.message || "เกิดข้อผิดพลาดในการลบ (อาจมีพนักงานใช้งานอยู่)");
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">ตำแหน่ง</h1>
          <p className="text-gray-500 text-sm mt-1">ตั้งค่าตำแหน่ง เช่น ผู้อำนวยการ, แพทย์, พยาบาลวิชาชีพ ฯลฯ</p>
        </div>
        <Button className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> เพิ่มตำแหน่งใหม่
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 bg-white border-b flex items-center justify-between">
          <div className="flex gap-4">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="ค้นหาตำแหน่ง..." 
                className="pl-9 bg-[#f0f2f5] border-none" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">เรียงลำดับ:</Label>
              <select 
                className="h-10 border rounded px-3 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                value={sortOrder} 
                onChange={e => setSortOrder(e.target.value)}
              >
                <option value="asc">ชื่อ (ก-ฮ)</option>
                <option value="desc">ชื่อ (ฮ-ก)</option>
              </select>
            </div>
          </div>
        </div>
        <Table className="bg-white">
          <TableHeader>
            <TableRow>
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>รายละเอียดเพิ่มเติม</TableHead>
              <TableHead className="w-[120px]">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</TableCell></TableRow>
            ) : filteredTypes.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-10 text-gray-500">ไม่พบข้อมูลตำแหน่ง</TableCell></TableRow>
            ) : (
              filteredTypes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-[#1877f2]">{item.name}</TableCell>
                  <TableCell className="text-gray-600">{item.description || "-"}</TableCell>
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
            <DialogTitle>{editingItem ? "แก้ไขตำแหน่ง" : "เพิ่มตำแหน่งใหม่"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อตำแหน่ง (เช่น แพทย์)</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="กรอกชื่อตำแหน่ง" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียดเพิ่มเติม (ไม่บังคับ)</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="อธิบายเพิ่มเติม (ถ้ามี)" />
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
