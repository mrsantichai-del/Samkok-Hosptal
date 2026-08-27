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
import { Calculator, Eye, CheckCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function PayrollPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1 + "");
  const [year, setYear] = useState(new Date().getFullYear() + "");
  const [processing, setProcessing] = useState(false);

  const router = useRouter();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_URL}/payroll/records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleProcess = async () => {
    setProcessing(true);
    try {
      const token = Cookies.get("token");
      await axios.post(`${API_URL}/payroll/process`, {
        month: parseInt(month),
        year: parseInt(year)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDialogOpen(false);
      fetchRecords();
    } catch (e: any) {
      alert(e.response?.data?.message || "เกิดข้อผิดพลาดในการประมวลผล");
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("คุณต้องการอนุมัติรายการเงินเดือนนี้ใช่หรือไม่? หลังจากอนุมัติแล้วจะไม่สามารถแก้ไขได้อีก")) return;
    try {
      const token = Cookies.get("token");
      await axios.patch(`${API_URL}/payroll/records/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRecords();
    } catch (e: any) {
      alert(e.response?.data?.message || "เกิดข้อผิดพลาดในการอนุมัติ (คุณอาจไม่มีสิทธิ์ Executive)");
    }
  };

  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

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
                <TableRow key={rec.id}>
                  <TableCell className="font-bold text-gray-700">
                    {monthNames[rec.month - 1]} {rec.year + 543}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      rec.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {rec.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'ฉบับร่าง (Draft)'}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {new Date(rec.createdAt).toLocaleDateString('th-TH')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-800" onClick={() => router.push(`/dashboard/payroll/${rec.id}`)}>
                        <Eye className="h-4 w-4 mr-1" /> ดูรายละเอียด
                      </Button>
                      {rec.status === 'DRAFT' && (
                        <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleApprove(rec.id)}>
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
