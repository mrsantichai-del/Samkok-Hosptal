"use client";
import { API_URL } from "@/lib/config";

import { useEffect, useState, use } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Save } from "lucide-react";

export default function PayrollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [allPayItems, setAllPayItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);

  // Spreadsheet state
  const [gridData, setGridData] = useState<Record<string, Record<string, string>>>({});
  const [modifiedRows, setModifiedRows] = useState<Set<string>>(new Set());
  const [savingGlobal, setSavingGlobal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const [txRes, itemsRes] = await Promise.all([
        axios.get(`${API_URL}/payroll/records/${resolvedParams.id}/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/pay-items`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setTransactions(txRes.data);
      setAllPayItems(itemsRes.data);

      const initialGrid: Record<string, Record<string, string>> = {};
      txRes.data.forEach((tx: any) => {
         if (!initialGrid[tx.employeeId]) initialGrid[tx.employeeId] = {};
         // Populate grid with string values for easy editing
         initialGrid[tx.employeeId][tx.payItemId] = tx.amount ? tx.amount.toString() : '';
      });
      setGridData(initialGrid);
      setModifiedRows(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const handleSaveAll = async () => {
    if (modifiedRows.size === 0) return;
    setSavingGlobal(true);
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
         
         return axios.patch(`${API_URL}/payroll/records/${resolvedParams.id}/employee/${empId}`, {
           transactions: txToSave
         }, { headers: { Authorization: `Bearer ${token}` } });
      });

      await Promise.all(promises);
      setModifiedRows(new Set());
      alert("บันทึกข้อมูลเรียบร้อยแล้ว");
      fetchData();
    } catch (e: any) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_URL}/payroll/records/${resolvedParams.id}/export/excel`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payroll_${resolvedParams.id}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (e) { alert("ไม่สามารถดาวน์โหลดไฟล์ Excel ได้"); }
  };

  const handleExportPdf = async () => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_URL}/payroll/records/${resolvedParams.id}/export/pdf`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url);
    } catch (e) { alert("ไม่สามารถดาวน์โหลดไฟล์ PDF ได้"); }
  };

  const incomeItems = allPayItems.filter(p => p.type === 'INCOME');
  const deductionItems = allPayItems.filter(p => p.type === 'DEDUCTION');

  // Extract unique employees
  const employeeMap = new Map<string, any>();
  transactions.forEach(tx => {
     if (!employeeMap.has(tx.employeeId)) {
        employeeMap.set(tx.employeeId, { employeeId: tx.employeeId, ...tx.employee });
     }
  });
  const employeeList = Array.from(employeeMap.values());

  return (
    <div className="space-y-4 max-w-full mx-auto pb-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/payroll')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">รายละเอียดการจ่ายเงินเดือน (แก้ไขแบบ Excel)</h1>
            <p className="text-gray-500 text-sm mt-1">สามารถพิมพ์ตัวเลขในช่องตารางและบันทึกข้อมูลได้ทันที</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            className={`${modifiedRows.size > 0 ? 'bg-[#1877f2] hover:bg-[#166fe5] animate-pulse' : 'bg-gray-400'} text-white`} 
            onClick={handleSaveAll}
            disabled={modifiedRows.size === 0 || savingGlobal}
          >
            <Save className="mr-2 h-4 w-4" /> 
            {savingGlobal ? "กำลังบันทึก..." : `บันทึกทั้งหมด (${modifiedRows.size} รายการ)`}
          </Button>
          <div className="w-px h-10 bg-gray-300 mx-2"></div>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" /> พิมพ์สลิป (PDF)
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" /> Export เป็น Excel
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">กำลังโหลดข้อมูลตาราง...</div>
      ) : employeeList.length === 0 ? (
        <div className="text-center py-20 text-gray-500">ไม่พบรายการเงินเดือน</div>
      ) : (
        <div className="border rounded-none overflow-x-auto overflow-y-auto shadow-sm bg-white" style={{ maxWidth: 'calc(100vw - 300px)', maxHeight: 'calc(100vh - 180px)' }}>
          <Table className="min-w-max border-collapse table-fixed">
            <TableHeader>
              <TableRow className="bg-gray-100 hover:bg-gray-100">
                <TableHead rowSpan={2} className="border border-gray-300 p-1 text-center sticky left-0 top-0 z-30 bg-gray-200 w-[160px] shadow-[1px_0_0_0_#d1d5db]">
                  รหัส - ชื่อพนักงาน
                </TableHead>
                {incomeItems.length > 0 && (
                  <TableHead colSpan={incomeItems.length} className="border border-gray-300 p-1 text-center text-green-800 bg-green-200/80 font-bold sticky top-0 z-20 text-xs">
                    รายรับ (+)
                  </TableHead>
                )}
                {deductionItems.length > 0 && (
                  <TableHead colSpan={deductionItems.length} className="border border-gray-300 p-1 text-center text-red-800 bg-red-200/80 font-bold sticky top-0 z-20 text-xs">
                    รายจ่ายและภาษี (-)
                  </TableHead>
                )}
                <TableHead rowSpan={2} className="border border-gray-300 p-1 text-center sticky right-0 top-0 z-30 bg-gray-200 w-[100px] shadow-[-1px_0_0_0_#d1d5db] font-bold">
                  รับสุทธิ
                </TableHead>
              </TableRow>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                {incomeItems.map(item => (
                  <TableHead key={item.id} className="border border-gray-300 p-1 text-center leading-tight text-[11px] bg-green-50 sticky top-[28px] z-20 w-[85px]">
                    <div className="truncate" title={item.name}>{item.name}</div>
                  </TableHead>
                ))}
                {deductionItems.map(item => (
                  <TableHead key={item.id} className="border border-gray-300 p-1 text-center leading-tight text-[11px] bg-red-50 sticky top-[28px] z-20 w-[85px]">
                    <div className="truncate" title={item.name}>{item.name}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeList.map(emp => {
                let totalIncome = 0;
                let totalDeduct = 0;
                incomeItems.forEach(item => totalIncome += Number(gridData[emp.employeeId]?.[item.id] || 0));
                deductionItems.forEach(item => totalDeduct += Number(gridData[emp.employeeId]?.[item.id] || 0));
                const net = totalIncome - totalDeduct;
                const isModified = modifiedRows.has(emp.employeeId);

                return (
                  <TableRow key={emp.employeeId} className={`hover:bg-blue-50/50 group ${isModified ? "bg-yellow-50/30" : ""}`}>
                    <TableCell className="border border-gray-300 p-1 sticky left-0 z-10 bg-white group-hover:bg-blue-50/50 font-medium shadow-[1px_0_0_0_#e5e7eb] truncate w-[160px] text-[11px]" title={`${emp.employeeCode} ${emp.firstName} ${emp.lastName}`}>
                      <span className="text-[#1877f2]">{emp.employeeCode}</span> {emp.firstName} {emp.lastName}
                    </TableCell>
                    
                    {incomeItems.map(item => (
                      <TableCell key={item.id} className="border border-gray-300 p-0 bg-white">
                        <Input 
                          type="number"
                          className="h-7 w-full text-right border-0 rounded-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-green-500 text-green-800 bg-transparent text-[11px] px-1"
                          value={gridData[emp.employeeId]?.[item.id] || ''}
                          onChange={(e) => {
                            setGridData(prev => ({...prev, [emp.employeeId]: {...(prev[emp.employeeId]||{}), [item.id]: e.target.value}}));
                            setModifiedRows(prev => new Set(prev).add(emp.employeeId));
                          }}
                        />
                      </TableCell>
                    ))}
                    
                    {deductionItems.map(item => (
                      <TableCell key={item.id} className="border border-gray-300 p-0 bg-white">
                        <Input 
                          type="number"
                          className="h-7 w-full text-right border-0 rounded-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-red-500 text-red-800 bg-transparent text-[11px] px-1"
                          value={gridData[emp.employeeId]?.[item.id] || ''}
                          onChange={(e) => {
                            setGridData(prev => ({...prev, [emp.employeeId]: {...(prev[emp.employeeId]||{}), [item.id]: e.target.value}}));
                            setModifiedRows(prev => new Set(prev).add(emp.employeeId));
                          }}
                        />
                      </TableCell>
                    ))}
                    
                    <TableCell className="border border-gray-300 p-1 text-right font-bold text-gray-800 sticky right-0 z-10 bg-gray-100 group-hover:bg-gray-200 shadow-[-1px_0_0_0_#e5e7eb] text-[11px]">
                      {net.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
