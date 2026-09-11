"use client";
import { API_URL } from "@/lib/config";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams, useRouter } from "next/navigation";
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, Save, Upload, Search, FileX2, Eye, Clock, CheckCircle, AlertCircle, Edit, Send, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { jwtDecode } from "jwt-decode";
import { showConfirm, showSuccess, showError } from "@/lib/swal";

export default function PayrollDetailPage() {
  const router = useRouter();
  const routeParams = useParams();
  const id = typeof routeParams?.id === "string" ? routeParams.id : Array.isArray(routeParams?.id) ? routeParams.id[0] : "";

  // Data
  const [record, setRecord] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [allPayItems, setAllPayItems] = useState<any[]>([]);
  const [employeeTypes, setEmployeeTypes] = useState<any[]>([]);
  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Spreadsheet state
  const [gridData, setGridData] = useState<Record<string, Record<string, string>>>({});
  const [modifiedRows, setModifiedRows] = useState<Set<string>>(new Set());
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [requestingApproval, setRequestingApproval] = useState(false);
  const [approving, setApproving] = useState(false);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc'|'desc' }>({ key: 'code', direction: 'asc' });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Import Preview State
  const [importPreviewOpen, setImportPreviewOpen] = useState(false);
  const [importSummary, setImportSummary] = useState({ modifiedCount: 0, newCount: 0, errors: [] as string[] });
  const [pendingGridData, setPendingGridData] = useState<Record<string, Record<string, string>> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewingEmp, setViewingEmp] = useState<any>(null);

  const getDisplayName = (val: any): string => {
    if (!val) return '-';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      if (val.name) return typeof val.name === 'object' ? getDisplayName(val.name) : String(val.name);
      if (val.title) return typeof val.title === 'object' ? getDisplayName(val.title) : String(val.title);
      if (val.label) return typeof val.label === 'object' ? getDisplayName(val.label) : String(val.label);
      if (val.code) return typeof val.code === 'object' ? getDisplayName(val.code) : String(val.code);
      return '-';
    }
    return String(val);
  };

  const getEmpCode = (val: any): string => {
    if (!val) return '-';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      if (val.employeeCode) return getEmpCode(val.employeeCode);
      if (val.code) return getEmpCode(val.code);
      if (val.name) return getDisplayName(val.name);
      return '-';
    }
    return String(val);
  };

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const [recRes, txRes, itemsRes, typeRes] = await Promise.all([
        axios.get(`${API_URL}/payroll/records/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/payroll/records/${id}/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/pay-items`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/employees/types`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRecord(recRes.data);
      setTransactions(txRes.data);
      setAllPayItems(itemsRes.data);
      setEmployeeTypes(typeRes.data);

      const initialGrid: Record<string, Record<string, string>> = {};
      const empMap = new Map<string, any>();

      txRes.data.forEach((tx: any) => {
         if (!initialGrid[tx.employeeId]) initialGrid[tx.employeeId] = {};
         initialGrid[tx.employeeId][tx.payItemId] = tx.amount ? tx.amount.toString() : '';

         if (!empMap.has(tx.employeeId)) {
            empMap.set(tx.employeeId, { employeeId: tx.employeeId, ...tx.employee });
         }
      });
      setGridData(initialGrid);
      setEmployeeList(Array.from(empMap.values()));
      setModifiedRows(new Set());
    } catch (e) {
      console.error(e);
      toast.error("ดึงข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser(decoded);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const isExecutiveOrAdmin = user?.roles?.some((r: string) => ['Executive', 'System Administrator'].includes(r));
  const isFinanceOrAdmin = user?.roles?.some((r: string) => ['Finance Officer', 'System Administrator'].includes(r));

  const handleRequestApproval = async () => {
    if (modifiedRows.size > 0) {
      showError("กรุณาบันทึกข้อมูลก่อน", "พบรายการแก้ไขที่ยังไม่ได้บันทึก กรุณากดปุ่ม 'บันทึกทั้งหมด' ก่อนส่งขออนุมัติ");
      return;
    }

    const result = await showConfirm({
      title: "ยืนยันการส่งขออนุมัติเงินเดือน",
      text: "คุณต้องการส่งรอบเงินเดือนนี้เพื่อขออนุมัติใช่หรือไม่? เมื่อส่งแล้วสถานะจะเปลี่ยนเป็น 'รอการอนุมัติ' และจะไม่สามารถแก้ไขตัวเลขในตารางได้",
      icon: "warning",
      confirmButtonText: "ยืนยันส่งขออนุมัติ",
      confirmButtonColor: "#d97706",
    });

    if (!result.isConfirmed) return;

    setRequestingApproval(true);
    const toastId = toast.loading("กำลังส่งขออนุมัติ...");
    try {
      const token = Cookies.get("token");
      await axios.patch(`${API_URL}/payroll/records/${id}/request-approval`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.dismiss(toastId);
      showSuccess("ส่งคำขออนุมัติสำเร็จ", "ระบบได้ส่งรอบเงินเดือนเพื่อรอผู้บริหารพิจารณาอนุมัติเรียบร้อยแล้ว");
      fetchData();
    } catch (err: any) {
      toast.dismiss(toastId);
      showError("เกิดข้อผิดพลาด", err.response?.data?.message || "ไม่สามารถส่งขออนุมัติได้");
    } finally {
      setRequestingApproval(false);
    }
  };

  const handleApprovePayroll = async () => {
    const result = await showConfirm({
      title: "ยืนยันการอนุมัติการจ่ายเงินเดือน",
      text: "คุณต้องการอนุมัติการจ่ายเงินเดือนประจำรอบนี้ใช่หรือไม่? เมื่ออนุมัติแล้วข้อมูลจะเข้าสู่สถานะ 'อนุมัติแล้ว' อย่างเป็นทางการ",
      icon: "question",
      confirmButtonText: "ยืนยันอนุมัติเงินเดือน",
      confirmButtonColor: "#059669",
    });

    if (!result.isConfirmed) return;

    setApproving(true);
    const toastId = toast.loading("กำลังอนุมัติเงินเดือน...");
    try {
      const token = Cookies.get("token");
      await axios.patch(`${API_URL}/payroll/records/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.dismiss(toastId);
      showSuccess("อนุมัติเงินเดือนเรียบร้อยแล้ว", "ระบบบันทึกการอนุมัติเงินเดือนและลายเซ็นอย่างเป็นทางการแล้ว");
      fetchData();
    } catch (err: any) {
      toast.dismiss(toastId);
      showError("เกิดข้อผิดพลาด", err.response?.data?.message || "ไม่สามารถอนุมัติเงินเดือนได้");
    } finally {
      setApproving(false);
    }
  };

  const handleSaveAll = async () => {
    if (modifiedRows.size === 0 || !id || record?.status !== 'DRAFT') return;
    setSavingGlobal(true);
    const toastId = toast.loading("กำลังบันทึกข้อมูล...");
    try {
      const token = Cookies.get("token");
      const promises = Array.from(modifiedRows).map(empId => {
         const txToSave = Object.keys(gridData[empId] || {})
           .filter(payItemId => {
              const val = gridData[empId][payItemId];
              return val !== undefined && val !== '' && !isNaN(Number(val));
           })
           .map(payItemId => ({
             payItemId,
             amount: Number(gridData[empId][payItemId])
           }));
         
         return axios.patch(`${API_URL}/payroll/records/${id}/employee/${empId}`, {
           transactions: txToSave
         }, { headers: { Authorization: `Bearer ${token}` } });
      });

      await Promise.all(promises);
      setModifiedRows(new Set());
      toast.success("บันทึกข้อมูลเรียบร้อยแล้ว", { id: toastId });
      fetchData();
    } catch (e: any) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก", { id: toastId });
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleExportExcel = async () => {
    if (!id) return;
    setIsExportingExcel(true);
    const toastId = toast.loading("กำลังสร้างไฟล์ Excel...");
    try {
      const token = Cookies.get("token");
      const employeeIds = filteredEmployees.map(e => e.employeeId);
      const res = await axios.post(`${API_URL}/payroll/records/${id}/export/excel`, { employeeIds }, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payroll_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      toast.success("ดาวน์โหลดไฟล์ Excel สำเร็จ", { id: toastId });
    } catch (e: any) {
      let errorMessage = e.message;
      if (e.response?.data instanceof Blob) {
        try {
          const text = await e.response.data.text();
          const json = JSON.parse(text);
          errorMessage = json.message || text;
        } catch (err) {
          try { errorMessage = await e.response.data.text(); } catch (err2) {}
        }
      } else if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      }
      toast.error(`ไม่สามารถดาวน์โหลดไฟล์ Excel ได้: ${errorMessage}`, { id: toastId });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    if (!id) return;
    setIsExportingPdf(true);
    const toastId = toast.loading("กำลังสร้างสลิปเงินเดือน (PDF)...");
    try {
      const token = Cookies.get("token");
      const employeeIds = filteredEmployees.map(e => e.employeeId);
      const res = await axios.post(`${API_URL}/payroll/records/${id}/export/pdf`, { employeeIds }, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url);
      toast.success("สร้างสลิปเงินเดือนสำเร็จ", { id: toastId });
    } catch (e: any) {
      let errorMessage = e.message;
      if (e.response?.data instanceof Blob) {
        try {
          const text = await e.response.data.text();
          const json = JSON.parse(text);
          errorMessage = json.message || text;
        } catch (err) {
          try { errorMessage = await e.response.data.text(); } catch (err2) {}
        }
      } else if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      }
      toast.error(`ไม่สามารถดาวน์โหลดไฟล์ PDF ได้: ${errorMessage}`, { id: toastId });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (record?.status !== 'DRAFT') return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as any[][];
        
        if (!data || data.length < 2) throw new Error("ไฟล์ Excel ไม่มีข้อมูลที่ถูกต้อง");

        const headers = data[0]; 
        const empCodeIndex = headers.indexOf('รหัสพนักงาน');
        if (empCodeIndex === -1) throw new Error("ไม่พบคอลัมน์ 'รหัสพนักงาน' ในแถวที่ 1 ของไฟล์ Excel");

        const colToPayItem: Record<number, string> = {};
        headers.forEach((h, idx) => {
           const match = allPayItems.find(p => p.name === String(h).trim());
           if (match) colToPayItem[idx] = match.id;
        });

        const newGrid = JSON.parse(JSON.stringify(gridData));
        let modifiedCount = 0;
        const errors: string[] = [];
        const pendingModifiedRows = new Set<string>();

        for (let i = 1; i < data.length; i++) {
           const row = data[i];
           if (!row || row.length === 0) continue;
           
           const empCode = row[empCodeIndex];
           if (!empCode) continue;

           const emp = employeeList.find(e => e.employeeCode === empCode);
           if (!emp) {
             errors.push(`แถวที่ ${i+1}: ไม่พบรหัสพนักงาน ${empCode} ในระบบ`);
             continue;
           }

           let rowModified = false;
           Object.keys(colToPayItem).forEach(colIdxStr => {
              const colIdx = Number(colIdxStr);
              const payItemId = colToPayItem[colIdx];
              let excelVal = row[colIdx];
              
              const currentVal = newGrid[emp.employeeId]?.[payItemId] || '';
              
              const normExcel = String(excelVal).trim();
              const normCurrent = String(currentVal).trim();
              
              const numExcel = normExcel === '' ? 0 : Number(normExcel.replace(/,/g, ''));
              const numCurrent = normCurrent === '' ? 0 : Number(normCurrent.replace(/,/g, ''));

              if (!isNaN(numExcel) && numExcel !== numCurrent) {
                 if (!newGrid[emp.employeeId]) newGrid[emp.employeeId] = {};
                 newGrid[emp.employeeId][payItemId] = numExcel === 0 ? '' : numExcel.toString();
                 rowModified = true;
              }
           });

           if (rowModified) {
              modifiedCount++;
              pendingModifiedRows.add(emp.employeeId);
           }
        }

        setPendingGridData(newGrid);
        setImportSummary({ modifiedCount, newCount: 0, errors });
        setImportPreviewOpen(true);
        (window as any).__pendingModified = pendingModifiedRows;

      } catch (err: any) {
        toast.error("เกิดข้อผิดพลาดในการอ่านไฟล์: " + err.message);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const confirmImport = () => {
    if (pendingGridData) {
      setGridData(pendingGridData);
      const pendingMods = (window as any).__pendingModified as Set<string>;
      if (pendingMods) {
        setModifiedRows(prev => new Set([...prev, ...pendingMods]));
      }
    }
    setImportPreviewOpen(false);
    setPendingGridData(null);
    toast.success("นำเข้าตัวเลขสำเร็จ! อย่าลืมกด บันทึกทั้งหมด เพื่อยืนยัน");
  };

  // Computations
  const incomeItems = allPayItems.filter(p => p.type === 'INCOME');
  const deductionItems = allPayItems.filter(p => p.type === 'DEDUCTION');

  let filteredEmployees = employeeList.filter(emp => {
    if (filterType !== "ALL" && emp.employeeType?.id !== filterType) return false;
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      const code = String(emp.employeeCode || '').toLowerCase();
      const first = String(emp.firstName || '').toLowerCase();
      const last = String(emp.lastName || '').toLowerCase();
      return first.includes(searchLower) || last.includes(searchLower) || code.includes(searchLower);
    }
    return true;
  });

  filteredEmployees.sort((a, b) => {
    let aValue: any = a.employeeCode || '';
    let bValue: any = b.employeeCode || '';

    if (sortConfig.key === 'name') {
       aValue = a.firstName || ''; bValue = b.firstName || '';
    } else if (sortConfig.key === 'type') {
       aValue = getDisplayName(a.employeeType); bValue = getDisplayName(b.employeeType);
    } else if (sortConfig.key === 'position') {
       aValue = getDisplayName(a.position); bValue = getDisplayName(b.position);
    } else if (sortConfig.key === 'net') {
       let aInc=0, aDed=0, bInc=0, bDed=0;
       incomeItems.forEach(i => aInc += Number(gridData[a.employeeId]?.[i.id] || 0));
       deductionItems.forEach(i => aDed += Number(gridData[a.employeeId]?.[i.id] || 0));
       incomeItems.forEach(i => bInc += Number(gridData[b.employeeId]?.[i.id] || 0));
       deductionItems.forEach(i => bDed += Number(gridData[b.employeeId]?.[i.id] || 0));
       aValue = aInc - aDed;
       bValue = bInc - bDed;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
       const cmp = aValue.localeCompare(bValue, 'th');
       return sortConfig.direction === 'asc' ? cmp : -cmp;
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const computeColTotal = (payItemId: string) => {
     let sum = 0;
     filteredEmployees.forEach(emp => {
        sum += Number(gridData[emp.employeeId]?.[payItemId] || 0);
     });
     return sum;
  };

  const computeNetTotal = () => {
     let sum = 0;
     filteredEmployees.forEach(emp => {
        let inc = 0, ded = 0;
        incomeItems.forEach(i => inc += Number(gridData[emp.employeeId]?.[i.id] || 0));
        deductionItems.forEach(i => ded += Number(gridData[emp.employeeId]?.[i.id] || 0));
        sum += (inc - ded);
     });
     return sum;
  };

  const isEditable = record?.status === 'DRAFT';

  const renderStatusBadge = () => {
    if (!record) return null;
    switch (record.status) {
      case 'DRAFT':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 font-semibold px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <Edit className="w-3.5 h-3.5 text-gray-600" /> ฉบับร่าง
          </Badge>
        );
      case 'PENDING_APPROVAL':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-semibold px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" /> รอการอนุมัติ
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-700" /> อนุมัติแล้ว
          </Badge>
        );
      case 'EDIT_REQUESTED':
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-900 border-orange-300 font-semibold px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <AlertCircle className="w-3.5 h-3.5 text-orange-700" /> ร้องขอแก้ไข
          </Badge>
        );
      default:
        return <Badge variant="outline">{record.status}</Badge>;
    }
  };

  return (
    <div className="fixed top-14 left-0 lg:left-[280px] right-0 bottom-0 bg-[#f0f2f5] flex flex-col p-2 lg:p-4 z-30">
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/payroll')} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">รายละเอียดการจ่ายเงินเดือน</h1>
          </div>
          {renderStatusBadge()}
        </div>
        <div className="flex gap-2 items-center">
          {isEditable && (
            <Button 
              className={`h-8 text-xs ${modifiedRows.size > 0 ? 'bg-[#1877f2] hover:bg-[#166fe5] animate-pulse' : 'bg-gray-400'} text-white`} 
              onClick={handleSaveAll}
              disabled={modifiedRows.size === 0 || savingGlobal}
            >
              <Save className="mr-1 h-3 w-3" /> 
              {savingGlobal ? "บันทึก..." : `บันทึกทั้งหมด (${modifiedRows.size})`}
            </Button>
          )}

          {record?.status === 'DRAFT' && (
            <Button 
              className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm"
              onClick={handleRequestApproval}
              disabled={requestingApproval || savingGlobal}
            >
              <Send className="mr-1 h-3 w-3" /> 
              {requestingApproval ? "กำลังส่ง..." : "ส่งขออนุมัติ"}
            </Button>
          )}

          {record?.status === 'PENDING_APPROVAL' && isExecutiveOrAdmin && (
            <Button 
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm animate-pulse"
              onClick={handleApprovePayroll}
              disabled={approving}
            >
              <Check className="mr-1 h-3.5 w-3.5" /> 
              {approving ? "กำลังอนุมัติ..." : "อนุมัติเงินเดือน"}
            </Button>
          )}

          <div className="w-px h-8 bg-gray-300 mx-1"></div>
          <Button className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={handleExportPdf} disabled={isExportingPdf}>
            <Download className="mr-1 h-3 w-3" /> {isExportingPdf ? "กำลังสร้าง PDF..." : "สลิป (PDF)"}
          </Button>
          <Button className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={handleExportExcel} disabled={isExportingExcel}>
            <Download className="mr-1 h-3 w-3" /> {isExportingExcel ? "กำลังส่งออก..." : "Export Excel"}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-2 items-center text-sm flex-shrink-0 bg-white p-2 rounded-md shadow-sm border">
         <div className="relative w-64">
            <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
            <Input className="h-8 pl-8 text-xs" placeholder="ค้นหาชื่อ/รหัสพนักงาน..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
         </div>
         <div className="flex items-center gap-2">
            <Label className="text-xs font-semibold whitespace-nowrap">ประเภท:</Label>
            <select className="h-8 border rounded px-2 text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500" value={filterType} onChange={e => setFilterType(e.target.value)}>
               <option value="ALL">ทั้งหมด (All)</option>
               {employeeTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
         </div>
         <div className="flex items-center gap-2">
            <Label className="text-xs font-semibold whitespace-nowrap">เรียงลำดับ:</Label>
            <select className="h-8 border rounded px-2 text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500" value={`${sortConfig.key}|${sortConfig.direction}`} onChange={e => {
               const [key, dir] = e.target.value.split('|');
               setSortConfig({ key, direction: dir as any });
            }}>
               <option value="code|asc">รหัสพนักงาน (A-Z)</option>
               <option value="name|asc">ชื่อ (ก-ฮ)</option>
               <option value="type|asc">ประเภทพนักงาน (ก-ฮ)</option>
               <option value="position|asc">ตำแหน่ง (ก-ฮ)</option>
               <option value="net|desc">รับสุทธิ (มากไปน้อย)</option>
               <option value="net|asc">รับสุทธิ (น้อยไปมาก)</option>
            </select>
         </div>
         
         <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
         <Button 
           variant="outline" 
           className="h-8 text-xs ml-auto border-green-300 text-green-700 bg-green-50 hover:bg-green-100" 
           onClick={() => fileInputRef.current?.click()}
           disabled={!isEditable}
           title={!isEditable ? "ไม่สามารถนำเข้าข้อมูลได้ในสถานะที่ไม่อนุญาตให้แก้ไข" : "นำเข้าตัวเลขจากไฟล์ Excel"}
         >
            <Upload className="h-3 w-3 mr-1" /> นำเข้า Excel (Import)
         </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-md flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Clock className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="text-sm font-medium">กำลังโหลดข้อมูลตาราง...</span>
          </div>
        </div>
      ) : employeeList.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-md flex-1 flex items-center justify-center">
          <span className="text-sm font-medium">ไม่พบรายการเงินเดือน</span>
        </div>
      ) : (
        <div className="border rounded-md shadow-sm bg-white flex flex-col flex-1 overflow-hidden relative">
          <div className="overflow-auto flex-1 relative">
            <table className="border-collapse h-max w-full text-sm" style={{ width: 'max-content' }}>
              <TableHeader className="sticky top-0 z-40 bg-gray-200">
                <TableRow>
                  <TableHead rowSpan={2} className="border border-gray-300 p-1 text-center sticky left-0 top-0 z-50 bg-gray-200 min-w-[30px] w-[30px]">ที่</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-300 p-1 text-center sticky left-[30px] top-0 z-50 bg-gray-200 min-w-[150px] w-[150px]">รหัส - ชื่อพนักงาน</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-300 p-1 text-center sticky left-[180px] top-0 z-50 bg-gray-200 min-w-[80px] w-[80px]">ตำแหน่ง</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-300 p-1 text-center sticky left-[260px] top-0 z-50 bg-gray-200 min-w-[80px] w-[80px] shadow-[1px_0_0_0_#d1d5db]">ประเภท</TableHead>
                  
                  {incomeItems.length > 0 && (
                    <TableHead colSpan={incomeItems.length} className="border border-gray-300 p-1 text-center text-green-900 bg-green-200/90 font-bold sticky top-0 z-40 text-xs">รายรับ (+)</TableHead>
                  )}
                  {deductionItems.length > 0 && (
                    <TableHead colSpan={deductionItems.length} className="border border-gray-300 p-1 text-center text-red-900 bg-red-200/90 font-bold sticky top-0 z-40 text-xs">รายจ่ายและภาษี (-)</TableHead>
                  )}
                  
                  <TableHead rowSpan={2} className="border border-gray-300 p-1 text-center sticky right-[60px] top-0 z-50 bg-gray-200 min-w-[100px] w-[100px] font-bold">รับสุทธิ</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-300 p-1 text-center sticky right-0 top-0 z-50 bg-gray-200 min-w-[60px] w-[60px] shadow-[-1px_0_0_0_#d1d5db] font-bold">จัดการ</TableHead>
                </TableRow>
                <TableRow>
                  {incomeItems.map(item => (
                    <TableHead key={item.id} className="border border-gray-300 p-1 text-center leading-tight text-[11px] bg-green-50 z-40 min-w-[95px] w-[95px] sticky top-[25px]">
                      <div className="truncate" title={item.name}>{item.name}</div>
                    </TableHead>
                  ))}
                  {deductionItems.map(item => (
                    <TableHead key={item.id} className="border border-gray-300 p-1 text-center leading-tight text-[11px] bg-red-50 z-40 min-w-[95px] w-[95px] sticky top-[25px]">
                      <div className="truncate" title={item.name}>{item.name}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                   <TableRow><TableCell colSpan={4 + incomeItems.length + deductionItems.length + 2} className="text-center py-10 text-gray-400">ไม่มีข้อมูลตามเงื่อนไขที่กรอง</TableCell></TableRow>
                ) : (
                   filteredEmployees.map((emp, index) => {
                     let totalIncome = 0;
                     let totalDeduct = 0;
                     incomeItems.forEach(item => totalIncome += Number(gridData[emp.employeeId]?.[item.id] || 0));
                     deductionItems.forEach(item => totalDeduct += Number(gridData[emp.employeeId]?.[item.id] || 0));
                     const net = totalIncome - totalDeduct;
                     const isModified = modifiedRows.has(emp.employeeId);

                     const posName = getDisplayName(emp.position);
                     const typeName = getDisplayName(emp.employeeType);

                     return (
                       <TableRow key={emp.employeeId} className={`hover:bg-blue-50/50 group ${isModified ? "bg-yellow-50/40" : ""}`}>
                         <TableCell className={`border border-gray-300 p-1 text-center sticky left-0 z-10 ${isModified ? "bg-yellow-50" : "bg-white"} group-hover:bg-blue-50/50 text-[11px] text-gray-500`}>
                           {index + 1}
                         </TableCell>
                         <TableCell className={`border border-gray-300 p-1 sticky left-[30px] z-10 ${isModified ? "bg-yellow-50" : "bg-white"} group-hover:bg-blue-50/50 font-medium truncate min-w-[150px] w-[150px] text-[11px]`} title={`${getEmpCode(emp.employeeCode)} ${getDisplayName(emp.firstName)} ${getDisplayName(emp.lastName)}`}>
                           <span className="text-[#1877f2] font-semibold">{getEmpCode(emp.employeeCode)}</span> {getDisplayName(emp.firstName)} {getDisplayName(emp.lastName)}
                         </TableCell>
                         <TableCell className={`border border-gray-300 p-1 text-center sticky left-[180px] z-10 ${isModified ? "bg-yellow-50" : "bg-white"} group-hover:bg-blue-50/50 truncate min-w-[80px] w-[80px] text-[10px] text-gray-600`} title={posName}>
                           {posName}
                         </TableCell>
                         <TableCell className={`border border-gray-300 p-1 text-center sticky left-[260px] z-10 ${isModified ? "bg-yellow-50" : "bg-white"} group-hover:bg-blue-50/50 truncate min-w-[80px] w-[80px] text-[10px] text-gray-600 shadow-[1px_0_0_0_#e5e7eb]`} title={typeName}>
                           {typeName}
                         </TableCell>
                         
                         {incomeItems.map(item => (
                           <TableCell key={item.id} className={`border border-gray-300 p-0 min-w-[95px] w-[95px] ${isModified ? "bg-yellow-50" : "bg-white"}`}>
                             <Input 
                               type="number" 
                               readOnly={!isEditable}
                               className={`h-7 w-full text-right border-0 rounded-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-green-500 text-green-800 bg-transparent text-[11px] px-1 ${!isEditable ? 'cursor-not-allowed opacity-90' : ''}`}
                               value={gridData[emp.employeeId]?.[item.id] || ''}
                               onChange={(e) => {
                                 if (!isEditable) return;
                                 setGridData(prev => ({...prev, [emp.employeeId]: {...(prev[emp.employeeId]||{}), [item.id]: e.target.value}}));
                                 setModifiedRows(prev => new Set(prev).add(emp.employeeId));
                               }}
                             />
                           </TableCell>
                         ))}
                         
                         {deductionItems.map(item => (
                           <TableCell key={item.id} className={`border border-gray-300 p-0 min-w-[95px] w-[95px] ${isModified ? "bg-yellow-50" : "bg-white"}`}>
                             <Input 
                               type="number" 
                               readOnly={!isEditable}
                               className={`h-7 w-full text-right border-0 rounded-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-red-500 text-red-800 bg-transparent text-[11px] px-1 ${!isEditable ? 'cursor-not-allowed opacity-90' : ''}`}
                               value={gridData[emp.employeeId]?.[item.id] || ''}
                               onChange={(e) => {
                                 if (!isEditable) return;
                                 setGridData(prev => ({...prev, [emp.employeeId]: {...(prev[emp.employeeId]||{}), [item.id]: e.target.value}}));
                                 setModifiedRows(prev => new Set(prev).add(emp.employeeId));
                               }}
                             />
                           </TableCell>
                         ))}
                         
                         <TableCell className={`border border-gray-300 p-1 text-right font-bold text-gray-900 sticky right-[60px] z-10 ${isModified ? "bg-yellow-100" : "bg-gray-100"} group-hover:bg-gray-200 text-[11px] min-w-[100px] w-[100px]`}>
                           {net.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                         </TableCell>
                         <TableCell className={`border border-gray-300 p-1 text-center sticky right-0 z-10 ${isModified ? "bg-yellow-100" : "bg-gray-100"} group-hover:bg-gray-200 shadow-[-1px_0_0_0_#e5e7eb] w-[60px]`}>
                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setViewingEmp(emp)} title="ดูรายละเอียดรายบุคคล">
                               <Eye className="h-4 w-4 text-blue-600" />
                             </Button>
                           </TableCell>
                         </TableRow>
                     )
                   })
                )}
              </TableBody>
              
              <TableFooter className="sticky bottom-0 z-40 bg-gray-200 font-bold shadow-[0_-1px_0_0_#d1d5db]">
                 <TableRow>
                   <TableCell colSpan={4} className="border border-gray-300 p-1 pr-4 text-right sticky left-0 z-50 bg-gray-200 w-[340px] shadow-[1px_0_0_0_#d1d5db] text-xs">รวมทั้งหมด ({filteredEmployees.length} คน):</TableCell>
                   {incomeItems.map(item => (
                      <TableCell key={item.id} className="border border-gray-300 p-1 text-right text-green-900 bg-green-100 z-40 min-w-[95px] w-[95px] text-[11px]">
                         {computeColTotal(item.id).toLocaleString(undefined, {minimumFractionDigits:2})}
                      </TableCell>
                   ))}
                   {deductionItems.map(item => (
                      <TableCell key={item.id} className="border border-gray-300 p-1 text-right text-red-900 bg-red-100 z-40 min-w-[95px] w-[95px] text-[11px]">
                         {computeColTotal(item.id).toLocaleString(undefined, {minimumFractionDigits:2})}
                      </TableCell>
                   ))}
                   <TableCell className="border border-gray-300 p-1 text-right text-black bg-gray-300 sticky right-0 z-50 min-w-[100px] w-[100px] shadow-[-1px_0_0_0_#d1d5db] text-[11px]">
                      {computeNetTotal().toLocaleString(undefined, {minimumFractionDigits:2})}
                   </TableCell>
                 </TableRow>
              </TableFooter>

            </table>
          </div>
        </div>
      )}

      {/* Import Preview Dialog */}
      <Dialog open={importPreviewOpen} onOpenChange={setImportPreviewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>ยืนยันการนำเข้าข้อมูล Excel</DialogTitle>
            <DialogDescription>ระบบตรวจพบความเปลี่ยนแปลงจากไฟล์ Excel ดังนี้</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md border border-blue-100">
                <span className="font-semibold text-blue-900">พนักงานที่มีการอัปเดตตัวเลข:</span>
                <span className="text-xl font-bold text-blue-700">{importSummary.modifiedCount} รายการ</span>
             </div>
             
             {importSummary.errors.length > 0 && (
                <div className="bg-red-50 p-3 rounded-md border border-red-100 max-h-40 overflow-y-auto">
                   <div className="flex items-center gap-1 font-semibold text-red-900 mb-2">
                     <FileX2 className="w-4 h-4" /> พบข้อผิดพลาด {importSummary.errors.length} รายการ
                   </div>
                   <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                      {importSummary.errors.map((err, i) => <li key={i}>{err}</li>)}
                   </ul>
                   <p className="text-xs text-red-600 mt-2 italic">*รายการที่ผิดพลาดจะถูกข้ามไป ไม่ถูกนำเข้า</p>
                </div>
             )}
             
             <p className="text-sm text-gray-600">
               *ข้อมูลจะยังไม่ถูกบันทึกลงฐานข้อมูลจนกว่าคุณจะกดปุ่ม <b>"บันทึกทั้งหมด"</b> สีน้ำเงินบนหน้าเว็บอีกครั้ง
             </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportPreviewOpen(false)}>ยกเลิก</Button>
            <Button className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={confirmImport}>
              ตกลง นำเข้าข้อมูล
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {viewingEmp && (
        <Dialog open={!!viewingEmp} onOpenChange={(open) => !open && setViewingEmp(null)}>
          <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-4 border-b bg-gray-50 flex-shrink-0">
              <DialogTitle className="text-lg flex justify-between items-center">
                <span>รายละเอียดเงินเดือน: {viewingEmp.firstName} {viewingEmp.lastName}</span>
                {!isEditable && (
                  <span className="text-xs font-normal text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full mr-6">
                    โหมดดูข้อมูลเท่านั้น (ไม่สามารถแก้ไขได้ในสถานะนี้)
                  </span>
                )}
              </DialogTitle>
              <DialogDescription>
                รหัส: {viewingEmp.employeeCode} | ตำแหน่ง: {getDisplayName(viewingEmp.position)} | ประเภท: {getDisplayName(viewingEmp.employeeType)}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
              <div className="grid grid-cols-2 gap-8 lg:gap-12">
                <div>
                  <h3 className="font-semibold text-green-700 mb-3 border-b border-green-200 pb-2">รายรับ (+)</h3>
                  <div className="space-y-2">
                    {incomeItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <Label className="text-sm text-gray-700 font-medium mr-4 leading-snug" title={item.name}>{item.name}</Label>
                        <Input 
                          type="number" 
                          readOnly={!isEditable}
                          className={`h-9 w-32 md:w-40 flex-shrink-0 text-right text-sm focus-visible:ring-green-500 ${!isEditable ? 'cursor-not-allowed bg-gray-100' : ''}`}
                          value={gridData[viewingEmp.employeeId]?.[item.id] || ''}
                          onChange={(e) => {
                            if (!isEditable) return;
                            setGridData(prev => ({...prev, [viewingEmp.employeeId]: {...(prev[viewingEmp.employeeId]||{}), [item.id]: e.target.value}}));
                            setModifiedRows(prev => new Set(prev).add(viewingEmp.employeeId));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-red-700 mb-3 border-b border-red-200 pb-2">รายจ่ายและภาษี (-)</h3>
                  <div className="space-y-2">
                    {deductionItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <Label className="text-sm text-gray-700 font-medium mr-4 leading-snug" title={item.name}>{item.name}</Label>
                        <Input 
                          type="number" 
                          readOnly={!isEditable}
                          className={`h-9 w-32 md:w-40 flex-shrink-0 text-right text-sm focus-visible:ring-red-500 ${!isEditable ? 'cursor-not-allowed bg-gray-100' : ''}`}
                          value={gridData[viewingEmp.employeeId]?.[item.id] || ''}
                          onChange={(e) => {
                            if (!isEditable) return;
                            setGridData(prev => ({...prev, [viewingEmp.employeeId]: {...(prev[viewingEmp.employeeId]||{}), [item.id]: e.target.value}}));
                            setModifiedRows(prev => new Set(prev).add(viewingEmp.employeeId));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-100 flex-shrink-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 text-sm gap-4">
                <div className="flex gap-6">
                  <div className="text-green-700">รวมรายรับ: <span className="font-bold">{incomeItems.reduce((sum, item) => sum + Number(gridData[viewingEmp.employeeId]?.[item.id] || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                  <div className="text-red-700">รวมรายจ่าย: <span className="font-bold">{deductionItems.reduce((sum, item) => sum + Number(gridData[viewingEmp.employeeId]?.[item.id] || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  รับสุทธิ: {(
                    incomeItems.reduce((sum, item) => sum + Number(gridData[viewingEmp.employeeId]?.[item.id] || 0), 0) -
                    deductionItems.reduce((sum, item) => sum + Number(gridData[viewingEmp.employeeId]?.[item.id] || 0), 0)
                  ).toLocaleString(undefined, {minimumFractionDigits: 2})} บาท
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setViewingEmp(null)} className="bg-[#1877f2] hover:bg-[#166fe5]">เสร็จสิ้น</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
