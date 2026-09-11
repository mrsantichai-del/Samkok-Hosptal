"use client";
import { API_URL } from "@/lib/config";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, Eye, CheckCircle, Clock, AlertCircle, Edit } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

export default function PayrollPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1 + "");
  const [year, setYear] = useState(new Date().getFullYear() + "");
  const [processing, setProcessing] = useState(false);

  const router = useRouter();

  const isExecutiveOrAdmin = user?.roles?.some((r: string) => ['Executive', 'System Administrator'].includes(r));

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      if (token) {
        try {
          setUser(jwtDecode(token));
        } catch (e) {}
      }
      const res = await axios.get(`${API_URL}/payroll/records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      toast.error("ไม่สามารถดึงข้อมูลรอบเงินเดือนได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleProcess = async () => {
    setProcessing(true);
    const toastId = toast.loading("ระบบกำลังคำนวณและสร้างรอบเงินเดือน...");
    try {
      const token = Cookies.get("token");
      await axios.post(`${API_URL}/payroll/process`, {
        month: parseInt(month),
        year: parseInt(year)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("ประมวลผลเงินเดือนรอบใหม่สำเร็จ", { id: toastId });
      setIsDialogOpen(false);
      fetchRecords();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการประมวลผล", { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("คุณต้องการอนุมัติรายการเงินเดือนนี้ใช่หรือไม่? หลังจากอนุมัติแล้วจะไม่สามารถแก้ไขได้อีก")) return;
    const toastId = toast.loading("กำลังอนุมัติเงินเดือน...");
    try {
      const token = Cookies.get("token");
      await axios.patch(`${API_URL}/payroll/records/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("อนุมัติเงินเดือนเรียบร้อยแล้ว", { id: toastId });
      fetchRecords();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการอนุมัติ", { id: toastId });
    }
  };

  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 font-semibold px-2 py-0.5 flex items-center gap-1 w-fit">
            <Edit className="w-3 h-3 text-gray-600" /> ฉบับร่าง
          </Badge>
        );
      case 'PENDING_APPROVAL':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-semibold px-2 py-0.5 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-amber-700 animate-spin" /> รอการอนุมัติ
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold px-2 py-0.5 flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3 text-emerald-700" /> อนุมัติแล้ว
          </Badge>
        );
      case 'EDIT_REQUESTED':
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-900 border-orange-300 font-semibold px-2 py-0.5 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3 text-orange-700" /> ร้องขอแก้ไข
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">ประมวลผลเงินเดือน</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการและคำนวณเงินเดือนประจำเดือน</p>
        </div>
        <Button className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={() => setIsDialogOpen(true)}>
          <Calculator className="mr-2 h-4 w-4" /> เริ่มประมวลผลรอบใหม่
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-lg overflow-hidden">
        <Table className="bg-white">
          <TableHeader>
            <TableRow>
              <TableHead>ประจำเดือน / ปี</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>วันที่สร้าง</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-gray-500">ยังไม่มีประวัติการประมวลผลเงินเดือน</TableCell></TableRow>
            ) : (
              records.map((rec) => (
                <TableRow key={rec.id} className="hover:bg-gray-50">
                  <TableCell className="font-bold text-gray-800">
                    {monthNames[rec.month - 1]} {rec.year + 543}
                  </TableCell>
                  <TableCell>
                    {renderStatusBadge(rec.status)}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(rec.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-800" onClick={() => router.push(`/dashboard/payroll/${rec.id}`)}>
                        <Eye className="h-4 w-4 mr-1" /> ดูรายละเอียด
                      </Button>
                      {rec.status === 'PENDING_APPROVAL' && isExecutiveOrAdmin && (
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium" onClick={() => handleApprove(rec.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" /> อนุมัติ
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>เลือกเดือนและปี ที่ต้องการประมวลผล</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>เดือน</Label>
              <Select value={month} onValueChange={(val) => setMonth(val as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกเดือน" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((m, i) => (
                    <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ปี (ค.ศ.)</Label>
              <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
              <p className="text-xs text-gray-400">ระบบจะบวก 543 เพื่อแสดงเป็นปี พ.ศ. โดยอัตโนมัติ</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
            <Button className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={handleProcess} disabled={processing}>
              {processing ? "ระบบกำลังคำนวณ..." : "เริ่มประมวลผล"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
