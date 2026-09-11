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
import { Calculator, Eye, CheckCircle, Clock, AlertCircle, Edit, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Layers } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { showSuccess, showError } from "@/lib/swal";

export default function PayrollPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog State for Process
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1 + "");
  const [year, setYear] = useState(new Date().getFullYear() + "");
  const [round, setRound] = useState("1");
  const [roundPreset, setRoundPreset] = useState("รอบปกติ (เงินเดือนหลัก)");
  const [customRoundName, setCustomRoundName] = useState("");
  const [processing, setProcessing] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const router = useRouter();

  const fetchRecords = async (retryCount = 0) => {
    if (retryCount === 0) setLoading(true);
    try {
      const token = Cookies.get("token");
      if (!token) return;
      const res = await axios.get(`${API_URL}/payroll/records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(res.data);
      setLoading(false);
    } catch (e: any) {
      console.error(e);
      if (retryCount < 2) {
        setTimeout(() => fetchRecords(retryCount + 1), 1500);
      } else {
        toast.error("ดึงข้อมูลรอบเงินเดือนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleProcess = async () => {
    setProcessing(true);
    const toastId = toast.loading("กำลังประมวลผลเงินเดือน...");
    try {
      const token = Cookies.get("token");
      const roundNumber = parseInt(round) || 1;
      let finalRoundName = roundPreset;
      if (roundPreset === "custom") {
        finalRoundName = customRoundName.trim() || `งวดที่ ${roundNumber}`;
      }

      await axios.post(`${API_URL}/payroll/process`, {
        month: parseInt(month),
        year: parseInt(year),
        round: roundNumber,
        roundName: finalRoundName,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.dismiss(toastId);
      setIsDialogOpen(false);
      showSuccess("เริ่มประมวลผลสำเร็จ", `สร้างรอบเงินเดือนเดือน ${monthNames[parseInt(month) - 1]} ${parseInt(year) + 543} (งวดที่ ${roundNumber}: ${finalRoundName}) เรียบร้อยแล้ว`);
      fetchRecords();
    } catch (e: any) {
      toast.dismiss(toastId);
      showError("เกิดข้อผิดพลาด", e.response?.data?.message || "เกิดข้อผิดพลาดในการประมวลผลเงินเดือน");
    } finally {
      setProcessing(false);
    }
  };

  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 font-semibold px-2.5 py-0.5 flex items-center gap-1.5 w-fit">
            <Edit className="w-3.5 h-3.5 text-gray-600" /> ฉบับร่าง
          </Badge>
        );
      case 'PENDING_APPROVAL':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-semibold px-2.5 py-0.5 flex items-center gap-1.5 w-fit">
            <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" /> รอการอนุมัติ
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold px-2.5 py-0.5 flex items-center gap-1.5 w-fit">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-700" /> อนุมัติแล้ว
          </Badge>
        );
      case 'EDIT_REQUESTED':
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-900 border-orange-300 font-semibold px-2.5 py-0.5 flex items-center gap-1.5 w-fit">
            <AlertCircle className="w-3.5 h-3.5 text-orange-700" /> ร้องขอแก้ไข
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Pagination Computations
  const totalItems = records.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedRecords = records.slice(startIndex, endIndex);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">ประมวลผลเงินเดือน</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการรอบและงวดการจ่ายเงินเดือนประจำเดือน (รองรับหลายงวดต่อเดือน)</p>
        </div>
        <Button className="bg-[#1877f2] hover:bg-[#166fe5] shadow-sm font-medium" onClick={() => setIsDialogOpen(true)}>
          <Calculator className="mr-2 h-4 w-4" /> เริ่มประมวลผลรอบใหม่
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="w-16 text-center font-bold text-gray-700">ลำดับ</TableHead>
              <TableHead className="font-bold text-gray-700">ประจำเดือน / ปี / งวด</TableHead>
              <TableHead className="font-bold text-gray-700">สถานะ</TableHead>
              <TableHead className="font-bold text-gray-700">วันที่สร้าง</TableHead>
              <TableHead className="text-right font-bold text-gray-700">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-gray-500">กำลังโหลดข้อมูล...</TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-gray-500">ยังไม่มีประวัติการประมวลผลเงินเดือน</TableCell></TableRow>
            ) : (
              paginatedRecords.map((rec, index) => {
                const rowNumber = startIndex + index + 1;
                const roundNum = rec.round || 1;
                const roundLabel = rec.roundName || (roundNum === 1 ? 'รอบปกติ' : `งวดที่ ${roundNum}`);

                return (
                  <TableRow key={rec.id} className="hover:bg-blue-50/40 transition-colors">
                    <TableCell className="text-center font-medium text-gray-500">
                      {rowNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-gray-800 text-base">
                          {monthNames[rec.month - 1]} {rec.year + 543}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-800 border border-blue-200">
                          <Layers className="w-3 h-3 text-blue-600" /> งวดที่ {roundNum}: {roundLabel}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(rec.status)}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(rec.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200" onClick={() => router.push(`/dashboard/payroll/${rec.id}`)}>
                          <Eye className="h-4 w-4 mr-1" /> ดูรายละเอียด
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Toolbar */}
        {!loading && totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t bg-gray-50/60 text-sm text-gray-600 gap-3">
            <div className="flex items-center gap-2">
              <span>แสดง</span>
              <select 
                className="h-8 border rounded px-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>รายการต่อหน้า | แสดง {startIndex + 1} - {endIndex} จากทั้งหมด {totalItems} งวด</span>
            </div>

            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setCurrentPage(1)} 
                disabled={validCurrentPage <= 1}
                title="หน้าแรก"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={validCurrentPage <= 1}
                title="หน้าก่อนหน้า"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => Math.abs(page - validCurrentPage) <= 2 || page === 1 || page === totalPages)
                  .map((page, idx, arr) => {
                    const isPrevSkipped = idx > 0 && page - arr[idx - 1] > 1;
                    return (
                      <span key={page} className="flex items-center">
                        {isPrevSkipped && <span className="px-1 text-gray-400">...</span>}
                        <Button
                          variant={page === validCurrentPage ? "default" : "outline"}
                          size="sm"
                          className={`h-8 min-w-[32px] px-2 text-xs ${page === validCurrentPage ? 'bg-[#1877f2] text-white hover:bg-[#166fe5]' : 'text-gray-700'}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </span>
                    );
                  })}
              </div>

              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={validCurrentPage >= totalPages}
                title="หน้าถัดไป"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setCurrentPage(totalPages)} 
                disabled={validCurrentPage >= totalPages}
                title="หน้าสุดท้าย"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Start Process Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" /> เริ่มประมวลผลรอบเงินเดือนใหม่
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">เดือน</Label>
                <Select value={month} onValueChange={(val) => setMonth(val as string)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="เลือกเดือน" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((m, i) => (
                      <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">ปี (ค.ศ.)</Label>
                <Input type="number" className="h-9" value={year} onChange={(e) => setYear(e.target.value)} />
                <p className="text-[11px] text-gray-400">แสดงเป็น พ.ศ. {parseInt(year || "0") + 543}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5 col-span-1">
                <Label className="text-xs font-semibold">งวดที่ (Round)</Label>
                <Select value={round} onValueChange={(val) => setRound(val as string)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="เลือกงวด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">งวดที่ 1</SelectItem>
                    <SelectItem value="2">งวดที่ 2</SelectItem>
                    <SelectItem value="3">งวดที่ 3</SelectItem>
                    <SelectItem value="4">งวดที่ 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs font-semibold">ประเภทของงวด</Label>
                <Select value={roundPreset} onValueChange={(val) => setRoundPreset(val as string)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="เลือกประเภทงวด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="รอบปกติ (เงินเดือนหลัก)">รอบปกติ (เงินเดือนหลัก)</SelectItem>
                    <SelectItem value="รอบค่าเวร / OT / ค่าตอบแทนพิเศษ">รอบค่าเวร / OT / ค่าตอบแทนพิเศษ</SelectItem>
                    <SelectItem value="รอบเงินตกเบิก">รอบเงินตกเบิก</SelectItem>
                    <SelectItem value="custom">กำหนดชื่อรอบเอง...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {roundPreset === "custom" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">ระบุชื่อรอบเงินเดือน</Label>
                <Input 
                  placeholder="เช่น ค่าตอบแทนพิเศษ พ.ต.ส., รอบฉุกเฉิน..." 
                  className="h-9" 
                  value={customRoundName} 
                  onChange={(e) => setCustomRoundName(e.target.value)} 
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={processing}>ยกเลิก</Button>
            <Button className="bg-[#1877f2] hover:bg-[#166fe5] font-medium" onClick={handleProcess} disabled={processing}>
              {processing ? "ระบบกำลังคำนวณ..." : "เริ่มประมวลผล"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
