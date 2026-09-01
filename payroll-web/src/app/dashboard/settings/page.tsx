"use client";
import { API_URL } from "@/lib/config";

import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [logo, setLogo] = useState<File | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (type: 'logo' | 'signature') => {
    const file = type === 'logo' ? logo : signature;
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = Cookies.get("token");
      await axios.post(`${API_URL}/settings/upload-${type}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(`อัปโหลด ${type === 'logo' ? 'โลโก้' : 'ลายเซ็น'} สำเร็จ!`);
      if (type === 'logo') setLogo(null);
      else setSignature(null);
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">ตั้งค่าระบบ</h1>
        <p className="text-gray-500 text-sm mt-1">ตั้งค่าโลโก้โรงพยาบาลสำหรับออกสลิปเงินเดือน (PDF)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รูปโลโก้โรงพยาบาล</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label>เลือกไฟล์โลโก้ (.png, .jpg)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
            </div>
            <Button className="bg-[#1877f2] hover:bg-[#166fe5] mt-6" onClick={() => handleUpload('logo')} disabled={!logo || uploading}>
              อัปโหลด
            </Button>
          </div>
          <div>
            <p className="text-sm font-bold mb-2">โลโก้ปัจจุบัน:</p>
            <img src={`${API_URL}/settings/logo`} alt="Logo" className="h-20 object-contain border p-2 rounded" onError={(e) => (e.currentTarget.style.display = 'none')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ลายเซ็นผู้อนุมัติ / ฝ่ายการเงิน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label>เลือกไฟล์ลายเซ็น (.png, .jpg)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setSignature(e.target.files?.[0] || null)} />
            </div>
            <Button className="bg-[#1877f2] hover:bg-[#166fe5] mt-6" onClick={() => handleUpload('signature')} disabled={!signature || uploading}>
              อัปโหลด
            </Button>
          </div>
          <div>
            <p className="text-sm font-bold mb-2">ลายเซ็นปัจจุบัน:</p>
            <img src={`${API_URL}/settings/signature`} alt="Signature" className="h-20 object-contain border p-2 rounded" onError={(e) => (e.currentTarget.style.display = 'none')} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
