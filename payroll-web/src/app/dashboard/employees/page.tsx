"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = Cookies.get("token");
        const res = await axios.get("http://localhost:3000/employees", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEmployees(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ข้อมูลพนักงาน</h1>
        <Button className="bg-[#1877f2] hover:bg-[#166fe5]">
          <Plus className="mr-2 h-4 w-4" /> เพิ่มพนักงานใหม่
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 bg-white border-b flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="ค้นหาชื่อพนักงาน..." 
              className="pl-9 bg-[#f0f2f5] border-none"
            />
          </div>
        </div>
        <Table className="bg-white">
          <TableHeader>
            <TableRow>
              <TableHead>รหัสพนักงาน</TableHead>
              <TableHead>ชื่อ - นามสกุล</TableHead>
              <TableHead>เลขบัตรประชาชน</TableHead>
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>ประเภทพนักงาน</TableHead>
              <TableHead>สถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                  กำลังโหลดข้อมูล...
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                  ไม่พบข้อมูลพนักงาน
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.employeeCode}</TableCell>
                  <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                  <TableCell>{emp.idCard || "-"}</TableCell>
                  <TableCell>{emp.position?.name || "-"}</TableCell>
                  <TableCell>{emp.employeeType?.name || "-"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ทำงาน
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
