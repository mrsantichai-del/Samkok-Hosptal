"use client";
import { API_URL } from "@/lib/config";

import React, { useEffect, useState } from "react";
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
import { Search, Plus, Edit, Trash2, ArrowUpDown, Layers, Calendar, CheckCircle2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const MONTH_NAMES = [
  "มกราคม (เดือน 1)",
  "กุมภาพันธ์ (เดือน 2)",
  "มีนาคม (เดือน 3)",
  "เมษายน (เดือน 4)",
  "พฤษภาคม (เดือน 5)",
  "มิถุนายน (เดือน 6)",
  "กรกฎาคม (เดือน 7)",
  "สิงหาคม (เดือน 8)",
  "กันยายน (เดือน 9)",
  "ตุลาคม (เดือน 10)",
  "พฤศจิกายน (เดือน 11)",
  "ธันวาคม (เดือน 12)",
];

export default function PayItemsPage() {
  const [payItems, setPayItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState("INCOME");
  const [formula, setFormula] = useState("");
  const [isAccumulative, setIsAccumulative] = useState(false);
  const [accumulateResetType, setAccumulateResetType] = useState("CALENDAR_YEAR");
  const [accumulateStartMonth, setAccumulateStartMonth] = useState(1);
  const [accumulateLabel, setAccumulateLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);

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
    setIsAccumulative(false);
    setAccumulateResetType("CALENDAR_YEAR");
    setAccumulateStartMonth(1);
    setAccumulateLabel("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setType(item.type);
    setFormula(item.defaultFormula || "");
    setIsAccumulative(Boolean(item.isAccumulative));
    setAccumulateResetType(item.accumulateResetType || "CALENDAR_YEAR");
    setAccumulateStartMonth(item.accumulateStartMonth || 1);
    setAccumulateLabel(item.accumulateLabel || "");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = Cookies.get("token");
      const payload = {
        name,
        type,
        defaultFormula: formula === "" ? null : formula,
        isAccumulative,
        accumulateResetType: isAccumulative ? accumulateResetType : "CALENDAR_YEAR",
        accumulateStartMonth: isAccumulative ? Number(accumulateStartMonth) || 1 : 1,
        accumulateLabel: isAccumulative && accumulateLabel.trim() ? accumulateLabel.trim() : null,
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
      toast.success(editingItem ? "แก้ไขข้อมูลสำเร็จ" : "เพิ่มรายการสำเร็จ");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
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
      await axios.delete(`${API_URL}/payroll/items/${deleteItem.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteItem(null);
      fetchPayItems();
      toast.success("ลบข้อมูลสำเร็จ");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการลบ");
    } finally {
      setSaving(false);
    }
  };

  const filteredPayItems = payItems.filter(item => item.name.toLowerCase().includes(debouncedSearch.toLowerCase()));

  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>;
    }
    return <ArrowUpDown className="ml-1 h-3 w-3 inline-block text-gray-400 opacity-50" />;
  };

  const sortedPayItems = React.useMemo(() => {
    let sortableItems = [...filteredPayItems];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key] || '';
        let bValue = b[sortConfig.key] || '';

        if (sortConfig.key === 'type') {
          aValue = a.type === 'INCOME' ? '1_INCOME' : '2_DEDUCTION';
          bValue = b.type === 'INCOME' ? '1_INCOME' : '2_DEDUCTION';
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredPayItems, sortConfig]);

  const renderAccumulateBadge = (item: any) => {
    if (!item.isAccumulative) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-normal text-gray-400 bg-gray-50 border border-gray-100">
          ไม่สะสม
        </span>
      );
    }

    if (item.accumulateResetType === "CALENDAR_YEAR") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          ปีปฏิทิน (1 ม.ค.)
        </span>
      );
    }

    if (item.accumulateResetType === "FISCAL_YEAR") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Calendar className="w-3 h-3 text-blue-500" />
          ปีงบประมาณ (1 ต.ค.)
        </span>
      );
    }

    if (item.accumulateResetType === "CUSTOM_MONTH") {
      const monthIdx = (item.accumulateStartMonth || 1) - 1;
      const monthShort = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][monthIdx];
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          <Layers className="w-3 h-3 text-purple-500" />
          เริ่ม {monthShort}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        สะสมตลอดไป
      </span>
    );
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">ตั้งค่า รายรับ-รายจ่าย</h1>
          <p className="text-gray-500 text-sm mt-1">กำหนดประเภทเงินได้ เงินหัก สูตรคำนวณ และการคำนวณยอดสะสมบนสลิปเงินเดือน</p>
        </div>
        <Button className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> เพิ่มรายการใหม่
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 bg-white border-b flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input placeholder="ค้นหารายการ..." className="pl-9 bg-[#f0f2f5] border-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <Table className="bg-white">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">ลำดับที่</TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("name")}>ชื่อรายการ {renderSortIcon("name")}</TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("type")}>ประเภท {renderSortIcon("type")}</TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("defaultFormula")}>สูตรคำนวณ (Default) {renderSortIcon("defaultFormula")}</TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("isAccumulative")}>ยอดสะสม (YTD) {renderSortIcon("isAccumulative")}</TableHead>
              <TableHead className="w-[100px]">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</TableCell></TableRow>
            ) : filteredPayItems.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-500">ไม่พบข้อมูลรายการตั้งค่า</TableCell></TableRow>
            ) : (
              sortedPayItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center text-gray-500">{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {item.name}
                    {item.accumulateLabel && (
                      <div className="text-[11px] text-gray-400 font-normal">
                        ป้ายสลิป: {item.accumulateLabel}
                      </div>
                    )}
                  </TableCell>
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
                    {renderAccumulateBadge(item)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => openEditDialog(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => promptDelete(item)}>
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
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "แก้ไขรายการรายรับ-รายจ่าย" : "เพิ่มรายการใหม่"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-gray-700">ชื่อรายการ *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น เงินเดือน, ค่าเวร, ภาษีหัก ณ ที่จ่าย" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-xs font-semibold text-gray-700">ประเภท *</Label>
                <Select value={type} onValueChange={(val) => setType(val as string)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกประเภท">
                      {type === "INCOME" ? "รายรับ (+)" : type === "DEDUCTION" ? "รายจ่าย (-)" : "เลือกประเภท"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">รายรับ (+)</SelectItem>
                    <SelectItem value="DEDUCTION">รายจ่าย (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="formula" className="text-xs font-semibold text-gray-700">สูตรคำนวณ (ไม่บังคับ)</Label>
                <Input id="formula" value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="เช่น BaseSalary * 0.05" />
              </div>
            </div>

            {/* Accumulation Settings Box */}
            <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-3.5 space-y-3 mt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <div>
                    <Label htmlFor="isAccumulative" className="text-sm font-bold text-gray-900 cursor-pointer">
                      คำนวณและแสดงยอดสะสม (YTD)
                    </Label>
                    <p className="text-[11px] text-gray-500">
                      แสดงยอดสะสมย้อนหลังบนสลิปเงินเดือนโดยอัตโนมัติ
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="isAccumulative"
                  checked={isAccumulative}
                  onChange={(e) => setIsAccumulative(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
                />
              </div>

              {isAccumulative && (
                <div className="space-y-3 pt-2 border-t border-blue-200/60 animate-in fade-in-50 duration-150">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">
                      รอบการตัดยอดและเริ่มสะสมใหม่
                    </Label>
                    <Select value={accumulateResetType} onValueChange={(val) => setAccumulateResetType(val as string)}>
                      <SelectTrigger className="bg-white text-xs w-full">
                        <SelectValue placeholder="เลือกรอบการสะสม">
                          {accumulateResetType === "CALENDAR_YEAR"
                            ? "📅 ปีปฏิทิน (1 ม.ค. - 31 ธ.ค.) - สำหรับภาษี, เงินได้, ประกันสังคม"
                            : accumulateResetType === "FISCAL_YEAR"
                            ? "🏛️ ปีงบประมาณราชการ (1 ต.ค. - 30 ก.ย.)"
                            : accumulateResetType === "CUSTOM_MONTH"
                            ? "⚙️ กำหนดเดือนเริ่มต้นเอง"
                            : accumulateResetType === "NEVER"
                            ? "♾️ สะสมต่อเนื่องตลอดไป (ไม่ตัดรอบ)"
                            : "เลือกรอบการสะสม"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CALENDAR_YEAR">
                          📅 ปีปฏิทิน (1 ม.ค. - 31 ธ.ค.) - สำหรับภาษี, เงินได้, ประกันสังคม
                        </SelectItem>
                        <SelectItem value="FISCAL_YEAR">
                          🏛️ ปีงบประมาณราชการ (1 ต.ค. - 30 ก.ย.)
                        </SelectItem>
                        <SelectItem value="CUSTOM_MONTH">
                          ⚙️ กำหนดเดือนเริ่มต้นเอง
                        </SelectItem>
                        <SelectItem value="NEVER">
                          ♾️ สะสมต่อเนื่องตลอดไป (ไม่ตัดรอบ)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {accumulateResetType === "CUSTOM_MONTH" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-700">
                        เดือนที่เริ่มต้นรอบสะสม
                      </Label>
                      <Select 
                        value={String(accumulateStartMonth)} 
                        onValueChange={(val) => setAccumulateStartMonth(Number(val))}
                      >
                        <SelectTrigger className="bg-white text-xs w-full">
                          <SelectValue placeholder="เลือกเดือนเริ่มต้น">
                            {MONTH_NAMES[(Number(accumulateStartMonth) || 1) - 1] || "เลือกเดือนเริ่มต้น"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {MONTH_NAMES.map((m, idx) => (
                            <SelectItem key={idx + 1} value={String(idx + 1)}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">
                      ป้ายชื่อแสดงบนสลิปเงินเดือน (ไม่บังคับ)
                    </Label>
                    <Input
                      value={accumulateLabel}
                      onChange={(e) => setAccumulateLabel(e.target.value)}
                      placeholder={`เว้นว่างไว้จะใช้ "${name || 'รายการ'}สะสม"`}
                      className="bg-white text-xs"
                    />
                  </div>
                </div>
              )}
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
    
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">ยืนยันการลบข้อมูล</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-gray-600">
            คุณแน่ใจหรือไม่ที่จะลบ <span className="font-bold text-gray-900">{deleteItem?.name}</span>?<br/>
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
