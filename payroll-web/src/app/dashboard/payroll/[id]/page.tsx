"use client";
import { API_URL } from "@/lib/config";

import { useEffect, useState, use } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function PayrollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [allPayItems, setAllPayItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);

  // Edit Dialog State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any>(null);
  const [editForm, setEditForm] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const employeeData = transactions.reduce((acc: any, curr: any) => {
    if (!acc[curr.employeeId]) {
      acc[curr.employeeId] = { employee: curr.employee, incomes: 0, deductions: 0, net: 0, items: [] };
    }
    const amount = Number(curr.amount) || 0;
    if (curr.payItem.type === 'INCOME') {
      acc[curr.employeeId].incomes += amount;
      acc[curr.employeeId].net += amount;
    } else {
      acc[curr.employeeId].deductions += amount;
      acc[curr.employeeId].net -= amount;
    }
    acc[curr.employeeId].items.push(curr);
    return acc;
  }, {});

  const employeeList = Object.values(employeeData) as any[];

  const openEditDialog = (empCode: string) => {
    // Find employee id from code (the employeeData keys are employeeIds)
    const empId = Object.keys(employeeData).find(key => employeeData[key].employee.employeeCode === empCode);
    if (!empId) return;
    
    const emp = employeeData[empId];
    setEditingEmp({ id: empId, ...emp.employee });
    
    // Pre-fill existing amounts
    const formValues: { [key: string]: string } = {};
    emp.items.forEach((item: any) => {
      const matchingItem = allPayItems.find(p => p.name === item.payItem.name);
      if (matchingItem) {
        formValues[matchingItem.id] = item.amount.toString();
      }
    });
    setEditForm(formValues);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const token = Cookies.get("token");
      const txToSave = Object.keys(editForm)
        .filter(key => editForm[key] && !isNaN(Number(editForm[key])) && Number(editForm[key]) > 0)
        .map(key => ({
          payItemId: key,
          amount: Number(editForm[key])
        }));

      await axios.patch(`${API_URL}/payroll/records/${resolvedParams.id}/employee/${editingEmp.id}`, {
        transactions: txToSave
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsEditOpen(false);
      fetchData(); // Refresh table
    } catch (e: any) {
      alert(e.response?.data?.message || "ไม่สามารถบันทึกได้");
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/payroll')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">รายละเอียดการจ่ายเงินเดือน</h1>
            <p className="text-gray-500 text-sm mt-1">สรุปยอดเงินได้/เงินหัก รายบุคคล</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" /> พิมพ์สลิป (PDF)
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" /> Export เป็น Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">กำลังโหลดรายละเอียด...</div>
        ) : employeeList.length === 0 ? (
          <div className="text-center py-10 text-gray-500">ไม่พบรายการเงินเดือน</div>
        ) : (
          employeeList.map((emp: any, index: number) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-[#1877f2]">
                  {emp.employee.employeeCode} : {emp.employee.firstName} {emp.employee.lastName}
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-bold">
                    รับสุทธิ: <span className="text-green-600 text-lg">฿{emp.net.toLocaleString()}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(emp.employee.employeeCode)}>
                    <Edit2 className="h-4 w-4 mr-1" /> แก้ไขรายการ
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead>รายการ</TableHead>
                      <TableHead className="text-right w-[150px]">รายรับ (+)</TableHead>
                      <TableHead className="text-right w-[150px]">รายจ่าย (-)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emp.items.map((item: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{item.payItem.name} <span className="text-xs text-gray-400 ml-2">({item.formulaUsed})</span></TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          {item.payItem.type === 'INCOME' ? `฿${Number(item.amount).toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-medium">
                          {item.payItem.type === 'DEDUCTION' ? `฿${Number(item.amount).toLocaleString()}` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-50 font-bold border-t-2">
                      <TableCell className="text-right">รวมทั้งหมด</TableCell>
                      <TableCell className="text-right text-green-600">฿{emp.incomes.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-600">฿{emp.deductions.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขรายการเงินได้ / เงินหัก</DialogTitle>
            <p className="text-sm text-gray-500">พนักงาน: {editingEmp?.firstName} {editingEmp?.lastName}</p>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-8 py-4">
            {/* Incomes */}
            <div>
              <h3 className="font-bold text-green-600 mb-4 border-b pb-2">รายรับ (+)</h3>
              <div className="space-y-3">
                {incomeItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <Label className="w-1/2">{item.name}</Label>
                    <Input 
                      type="number" 
                      className="w-1/2 text-right" 
                      value={editForm[item.id] || ""} 
                      onChange={e => setEditForm({...editForm, [item.id]: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="font-bold text-red-600 mb-4 border-b pb-2">รายจ่าย (-) (รวมภาษี)</h3>
              <div className="space-y-3">
                {deductionItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <Label className="w-1/2">{item.name}</Label>
                    <Input 
                      type="number" 
                      className="w-1/2 text-right" 
                      value={editForm[item.id] || ""} 
                      onChange={e => setEditForm({...editForm, [item.id]: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>ยกเลิก</Button>
            <Button className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={handleSaveEdit} disabled={saving}>
              {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
