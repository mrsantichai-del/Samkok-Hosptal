"use client";
import { API_URL } from "@/lib/config";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Cookies from "js-cookie";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, Check, ChevronsUpDown, Download, Upload, ArrowUpDown, Printer } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeTypes, setEmployeeTypes] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idCard, setIdCard] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeTypeId, setEmployeeTypeId] = useState("unassigned");
  const [positionId, setPositionId] = useState("unassigned");
  const [departmentId, setDepartmentId] = useState("unassigned");
  const [openDept, setOpenDept] = useState(false);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPositionId, setFilterPositionId] = useState("all");
  const [filterDepartmentId, setFilterDepartmentId] = useState("all");
  const [filterTypeId, setFilterTypeId] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Combobox Open States
  const [openPos, setOpenPos] = useState(false);
  const [openType, setOpenType] = useState(false);

  // Derived filtered list
  const filteredEmployees = employees.filter(emp => {
    const s = searchTerm.toLowerCase();
      const matchSearch = (emp.firstName || "").toLowerCase().includes(s) || 
                          (emp.lastName || "").toLowerCase().includes(s) || 
                          (emp.employeeCode || "").toLowerCase().includes(s);
    const matchPos = filterPositionId === "all" || emp.positionId === filterPositionId;
    const matchDept = filterDepartmentId === "all" || emp.departmentId === filterDepartmentId;
    const matchType = filterTypeId === "all" || emp.employeeTypeId === filterTypeId;
    const matchStatus = filterStatus === "all" || (filterStatus === "active" ? !emp.resignedDate : !!emp.resignedDate);
    return matchSearch && matchPos && matchType && matchStatus && matchDept;
  });


  // Sort State
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  
  const [savingUser, setSavingUser] = useState<string | null>(null);

  const handleCreateUser = async (emp: any) => {
    setSavingUser(emp.id);
    try {
      const token = Cookies.get("token");
      await axios.post(`${API_URL}/employees/${emp.id}/create-user`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`สร้างผู้ใช้งานให้ ${emp.firstName} สำเร็จ`);
      fetchEmployees();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการสร้าง User");
    } finally {
      setSavingUser(null);
    }
  };

  
  const handlePrint = () => {
    window.print();
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedEmployees = React.useMemo(() => {
    let sortableItems = [...filteredEmployees];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key] || '';
        let bValue = b[sortConfig.key] || '';
        
        if (sortConfig.key === 'positionName') {
          aValue = a.position?.name || '';
          bValue = b.position?.name || '';
        } else if (sortConfig.key === 'typeName') {
          aValue = a.employeeType?.name || '';
          bValue = b.employeeType?.name || '';
        } else if (sortConfig.key === 'departmentName') {
          aValue = a.department?.name || '';
          bValue = b.department?.name || '';
        } else if (sortConfig.key === 'name') {
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredEmployees, sortConfig]);
  
  const renderSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>;
    }
    return <ArrowUpDown className="ml-1 h-3 w-3 inline-block text-gray-400" />;
  };

  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  
  // Excel Sync States
  const [diffData, setDiffData] = useState<any[]>([]);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);



  const handleExportExcel = () => {
    const data = sortedEmployees.map(emp => ({
      'รหัสพนักงาน': emp.employeeCode,
      'ชื่อ': emp.firstName,
      'นามสกุล': emp.lastName,
      'กลุ่มงาน': emp.department?.name || '',
      'ตำแหน่ง': emp.position?.name || '',
      'ประเภทพนักงาน': emp.employeeType?.name || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "Employees_Export.xlsx");
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        processExcelData(data);
      } catch (err) {
        toast.error("ไม่สามารถอ่านไฟล์ Excel ได้");
      }
      // reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

  const processExcelData = (excelRows: any[]) => {
    const changes: any[] = [];
    
    for (const row of excelRows) {
      const code = row['รหัสพนักงาน'];
      if (!code) continue;
      
      const emp = employees.find(e => e.employeeCode === code);
      if (!emp) continue; // Skip new employees for now (bulk update only)
      
      // Find IDs from names
      const posName = row['ตำแหน่ง'] || '';
      const typeName = row['ประเภทพนักงาน'] || '';
      
      const newPos = positions.find(p => p.name === posName);
      const newType = employeeTypes.find(t => t.name === typeName);
      
      const posId = newPos ? newPos.id : null;
      const typeId = newType ? newType.id : null;
      
      const isFirstNameChanged = emp.firstName !== (row['ชื่อ'] || '');
      const isLastNameChanged = emp.lastName !== (row['นามสกุล'] || '');
      const isPosChanged = (emp.positionId || null) !== posId;
      const isTypeChanged = (emp.employeeTypeId || null) !== typeId;
      
      if (isFirstNameChanged || isLastNameChanged || isPosChanged || isTypeChanged) {
        changes.push({
          empId: emp.id,
          employeeCode: emp.employeeCode,
          old: {
            firstName: emp.firstName,
            lastName: emp.lastName,
            positionName: emp.position?.name || '-',
            typeName: emp.employeeType?.name || '-'
          },
          new: {
            firstName: row['ชื่อ'] || '',
            lastName: row['นามสกุล'] || '',
            positionName: posName || '-',
            typeName: typeName || '-',
            positionId: posId,
            employeeTypeId: typeId
          }
        });
      }
    }
    
    if (changes.length > 0) {
      setDiffData(changes);
      setIsDiffOpen(true);
    } else {
      toast.info("ไม่มีข้อมูลเปลี่ยนแปลงจากไฟล์ที่อัปโหลด");
    }
  };

  const confirmBulkUpdate = async () => {
    setIsSyncing(true);
    const toastId = toast.loading("กำลังอัปเดตข้อมูล...");
    try {
      const token = Cookies.get("token");
      
      // Execute all patch requests concurrently
      await Promise.all(diffData.map(change => {
        return axios.patch(`${API_URL}/employees/${change.empId}`, {
          firstName: change.new.firstName,
          lastName: change.new.lastName,
          positionId: change.new.positionId,
          employeeTypeId: change.new.employeeTypeId
        }, { headers: { Authorization: `Bearer ${token}` } });
      }));
      
      toast.success("อัปเดตข้อมูลสำเร็จ", { id: toastId });
      setIsDiffOpen(false);
      setDiffData([]);
      fetchEmployees();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดต", { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const [empRes, typeRes, deptRes, posRes] = await Promise.all([
        axios.get(`${API_URL}/employees`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/employees/types`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/employees/departments`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/employees/positions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setEmployees(empRes.data);
      setEmployeeTypes(typeRes.data);
      setDepartments(deptRes.data);
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
    setEmployeeCode("");
    setFirstName("");
    setLastName("");
    setIdCard("");
    setEmployeeTypeId("unassigned");
    setPositionId("unassigned");
      setDepartmentId("unassigned");
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setEmployeeCode(item.employeeCode || "");
    setFirstName(item.firstName);
    setLastName(item.lastName);
    setIdCard(item.idCard || "");
    setEmployeeTypeId(item.employeeTypeId || "unassigned");
    setPositionId(item.positionId || "unassigned");
    setDepartmentId(item.departmentId || "unassigned");
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
      departmentId: departmentId === "unassigned" ? null : departmentId,
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
      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      console.error(e);
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
      await axios.delete(`${API_URL}/employees/${deleteItem.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteItem(null);
      fetchEmployees();
      toast.success("ลบข้อมูลสำเร็จ");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการลบ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto print:max-w-none print:w-full">
      {/* Official Print Header */}
      <div className="hidden print:block text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img src="/logo.jpg" alt="Logo" className="w-16 h-16 object-contain" />
          <h1 className="text-2xl font-bold font-serif text-black">โรงพยาบาลสามโคก (Samkok Hospital)</h1>
        </div>
        <h2 className="text-xl font-bold font-serif text-black">รายงานข้อมูลบุคลากร</h2>
        <p className="text-black font-serif">ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">ข้อมูลพนักงาน</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการรายชื่อพนักงานทั้งหมด</p>
        </div>
        <div className="flex gap-2">
          <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <Button variant="outline" className="text-gray-600 border-gray-600 hover:bg-gray-50 print:hidden" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> พิมพ์รายงาน
          </Button>
          <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 print:hidden" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" /> ส่งออก Excel
          </Button>
          <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50 print:hidden" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> นำเข้า Excel (อัปเดต)
          </Button>
          <Button className="bg-[#1877f2] hover:bg-[#166fe5] print:hidden" onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> เพิ่มพนักงานใหม่
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-lg overflow-hidden print:shadow-none print:rounded-none">
        <div className="p-4 bg-white border-b flex items-center justify-between print:hidden">
          <div className="flex gap-4 flex-wrap">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="ค้นหารหัส/ชื่อพนักงาน..." 
                className="pl-9 bg-[#f0f2f5] border-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">ตำแหน่ง:</Label>
              <select className="h-9 border rounded px-2 text-sm bg-gray-50" value={filterPositionId} onChange={e => setFilterPositionId(e.target.value)}>
                 <option value="all">ทั้งหมด (All)</option>
                 {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">ประเภท:</Label>
              <select className="h-9 border rounded px-2 text-sm bg-gray-50" value={filterTypeId} onChange={e => setFilterTypeId(e.target.value)}>
                 <option value="all">ทั้งหมด (All)</option>
                 {employeeTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold whitespace-nowrap">สถานะ:</Label>
              <select className="h-9 border rounded px-2 text-sm bg-gray-50" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                 <option value="all">ทั้งหมด (All)</option>
                 <option value="active">ทำงาน</option>
                 <option value="resigned">ลาออก</option>
              </select>
            </div>
          </div>
        </div>
        <Table className="bg-white print:text-black font-serif print:border-collapse print:[&_th]:border print:[&_td]:border print:[&_th]:border-black print:[&_td]:border-black print:[&_th]:bg-gray-100">
                      <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">ลำดับ</TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('employeeCode')}>
                  รหัสพนักงาน {renderSortIcon('employeeCode')}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('name')}>
                  ชื่อ - นามสกุล {renderSortIcon('name')}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('departmentName')}>
                  กลุ่มงาน {renderSortIcon('departmentName')}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('positionName')}>
                  ตำแหน่ง {renderSortIcon('positionName')}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('typeName')}>
                  ประเภทพนักงาน {renderSortIcon('typeName')}
                </TableHead>
                <TableHead>ผู้ใช้งาน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="w-[120px] print:hidden">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                  กำลังโหลดข้อมูล...
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                  ไม่พบข้อมูลพนักงาน
                </TableCell>
              </TableRow>
            ) : (
              sortedEmployees.map((emp, index) => (
                <TableRow key={emp.id}>
                  <TableCell className="text-center text-gray-500">{index + 1}</TableCell>
                    <TableCell className="font-medium">{emp.employeeCode}</TableCell>
                  <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                  <TableCell className="text-gray-600">
                    {emp.department?.name || "-"}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {emp.position?.name || "-"}
                  </TableCell>
                  <TableCell>
                    {emp.employeeType?.name ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {emp.employeeType.name}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    {emp.user ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                        <Check className="h-3 w-3" /> สร้างแล้ว
                      </span>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs bg-white text-[#1877f2] border-[#1877f2] hover:bg-[#1877f2] hover:text-white"
                        onClick={() => handleCreateUser(emp)}
                        disabled={savingUser === emp.id}
                      >
                        {savingUser === emp.id ? "กำลังสร้าง..." : "สร้าง User"}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {emp.resignedDate ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ลาออก
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ทำงาน
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="print:hidden">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => openEditDialog(emp)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => promptDelete(emp)}>
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
            <div className="space-y-2">
              <Label htmlFor="employeeCode">รหัสพนักงาน</Label>
              <Input id="employeeCode" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} placeholder="ถ้าปล่อยว่างระบบจะสร้างให้ (EMP-xxxxxx)" />
            </div>
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
              <Label>กลุ่มงาน</Label>
              <Popover open={openDept} onOpenChange={setOpenDept}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={openDept} className="w-full justify-between">
                    {departmentId === "unassigned" ? "ไม่ระบุ" : departments.find(d => d.id === departmentId)?.name || "เลือกกลุ่มงาน..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[380px] p-0" style={{ zIndex: 99999 }}>
                  <Command>
                    <CommandInput placeholder="ค้นหากลุ่มงาน..." />
                    <CommandEmpty>ไม่พบกลุ่มงาน</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        <CommandItem onSelect={() => { setDepartmentId("unassigned"); setOpenDept(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", departmentId === "unassigned" ? "opacity-100" : "opacity-0")} />
                          ไม่ระบุ
                        </CommandItem>
                        {departments.map(dept => (
                          <CommandItem key={dept.id} onSelect={() => { setDepartmentId(dept.id); setOpenDept(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", departmentId === dept.id ? "opacity-100" : "opacity-0")} />
                            {dept.name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>ตำแหน่ง</Label>
              <Popover open={openPos} onOpenChange={setOpenPos}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={openPos} className="w-full justify-between">
                    {positionId === "unassigned" ? "ไม่ระบุ" : positions.find(p => p.id === positionId)?.name || "เลือกตำแหน่ง..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[380px] p-0" style={{ zIndex: 99999 }}>
                  <Command>
                    <CommandInput placeholder="ค้นหาตำแหน่ง..." />
                    <CommandEmpty>ไม่พบตำแหน่ง</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        <CommandItem onSelect={() => { setPositionId("unassigned"); setOpenPos(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", positionId === "unassigned" ? "opacity-100" : "opacity-0")} />
                          ไม่ระบุ
                        </CommandItem>
                        {positions.map(pos => (
                          <CommandItem key={pos.id} onSelect={() => { setPositionId(pos.id); setOpenPos(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", positionId === pos.id ? "opacity-100" : "opacity-0")} />
                            {pos.name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>ประเภทพนักงาน</Label>
              <Popover open={openType} onOpenChange={setOpenType}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={openType} className="w-full justify-between">
                    {employeeTypeId === "unassigned" ? "ไม่ระบุ" : employeeTypes.find(t => t.id === employeeTypeId)?.name || "เลือกประเภท..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[380px] p-0" style={{ zIndex: 99999 }}>
                  <Command>
                    <CommandInput placeholder="ค้นหาประเภทพนักงาน..." />
                    <CommandEmpty>ไม่พบประเภทพนักงาน</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        <CommandItem onSelect={() => { setEmployeeTypeId("unassigned"); setOpenType(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", employeeTypeId === "unassigned" ? "opacity-100" : "opacity-0")} />
                          ไม่ระบุ
                        </CommandItem>
                        {employeeTypes.map(type => (
                          <CommandItem key={type.id} onSelect={() => { setEmployeeTypeId(type.id); setOpenType(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", employeeTypeId === type.id ? "opacity-100" : "opacity-0")} />
                            {type.name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
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
    
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">ยืนยันการลบข้อมูล</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-gray-600">
            คุณแน่ใจหรือไม่ที่จะลบ <span className="font-bold text-gray-900">{deleteItem?.employeeCode}</span>?<br/>
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
    
      {/* Diff Dialog for Excel Sync */}
      <Dialog open={isDiffOpen} onOpenChange={setIsDiffOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>ยืนยันการอัปเดตข้อมูล ({diffData.length} รายการ)</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสพนักงาน</TableHead>
                  <TableHead>ข้อมูลเดิม</TableHead>
                  <TableHead>ข้อมูลใหม่</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diffData.map((d, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium whitespace-nowrap">{d.employeeCode}</TableCell>
                    <TableCell className="text-xs text-gray-500">
                      <div>ชื่อ: {d.old.firstName} {d.old.lastName}</div>
                      <div>ต/น: {d.old.positionName}</div>
                      <div>ป/ภ: {d.old.typeName}</div>
                    </TableCell>
                    <TableCell className="text-xs text-blue-700 bg-blue-50/50">
                      <div>ชื่อ: <span className={d.old.firstName !== d.new.firstName || d.old.lastName !== d.new.lastName ? "font-bold text-blue-600" : ""}>{d.new.firstName} {d.new.lastName}</span></div>
                      <div>ต/น: <span className={d.old.positionName !== d.new.positionName ? "font-bold text-blue-600" : ""}>{d.new.positionName}</span></div>
                      <div>ป/ภ: <span className={d.old.typeName !== d.new.typeName ? "font-bold text-blue-600" : ""}>{d.new.typeName}</span></div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDiffOpen(false)}>ยกเลิก</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={confirmBulkUpdate} disabled={isSyncing}>
              {isSyncing ? "กำลังอัปเดต..." : "ยืนยันการอัปเดต"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
</div>
  );
}
