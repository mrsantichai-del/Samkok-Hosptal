"use client";
import { API_URL } from "@/lib/config";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Building2, FileText, Image as ImageIcon, PenTool, Save, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [logo, setLogo] = useState<File | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hospital Master Settings State
  const [hospitalForm, setHospitalForm] = useState({
    name: "โรงพยาบาลสามโคก",
    nameEn: "Samkok Hospital",
    taxId: "0994000164821",
    address: "เลขที่ 99 หมู่ 3 ถนนปทุมธานี-เสนา ตำบลสามโคก อำเภอสามโคก จังหวัดปทุมธานี 12160",
    phone: "02-593-1234",
    directorName: "ผู้อำนวยการโรงพยาบาลสามโคก",
    directorTitle: "ผู้อำนวยการโรงพยาบาลสามโคก"
  });

  // Fetch current hospital settings
  const fetchHospitalSettings = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_URL}/settings/hospital`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setHospitalForm({
          name: res.data.name || "โรงพยาบาลสามโคก",
          nameEn: res.data.nameEn || "Samkok Hospital",
          taxId: res.data.taxId || "0994000164821",
          address: res.data.address || "",
          phone: res.data.phone || "",
          directorName: res.data.directorName || "",
          directorTitle: res.data.directorTitle || "ผู้อำนวยการโรงพยาบาลสามโคก"
        });
      }
    } catch (e) {
      console.error("Could not fetch hospital settings", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalSettings();
  }, []);

  const handleSaveHospitalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tax ID validation (13 numeric digits)
    const cleanTaxId = hospitalForm.taxId.replace(/\D/g, "");
    if (cleanTaxId.length !== 13) {
      toast.error("เลขประจำตัวผู้เสียภาษีอากรต้องมี 13 หลัก (ปัจจุบันมี " + cleanTaxId.length + " หลัก)");
      return;
    }

    setSavingSettings(true);
    const toastId = toast.loading("กำลังบันทึกข้อมูลโรงพยาบาล...");

    try {
      const token = Cookies.get("token");
      await axios.put(`${API_URL}/settings/hospital`, {
        ...hospitalForm,
        taxId: cleanTaxId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("บันทึกข้อมูลโรงพยาบาลสำหรับออกเอกสาร 50 ทวิ เรียบร้อยแล้ว!", { id: toastId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึก", { id: toastId });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpload = async (type: 'logo' | 'signature') => {
    const file = type === 'logo' ? logo : signature;
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading(`กำลังอัปโหลด${type === 'logo' ? 'โลโก้' : 'ลายเซ็น'}...`);
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
      toast.success(`อัปโหลด ${type === 'logo' ? 'โลโก้' : 'ลายเซ็น'} สำเร็จ!`, { id: toastId });
      if (type === 'logo') setLogo(null);
      else setSignature(null);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "เกิดข้อผิดพลาดในการอัปโหลด", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-7 h-7 text-blue-600" /> ตั้งค่าโรงพยาบาลและระบบ (Hospital Master Settings)
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          กำหนดข้อมูลนิติบุคคล เลขประจำตัวผู้เสียภาษี 13 หลัก และผู้มีอำนาจลงนามสำหรับออกหนังสือรับรอง 50 ทวิ และสลิปเงินเดือน
        </p>
      </div>

      {/* 1. Hospital Master Information Form for 50 Tawi */}
      <Card className="border shadow-xs bg-white">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50/60 to-indigo-50/40 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <div>
              <CardTitle className="text-base font-bold text-gray-900">
                ข้อมูลหน่วยงานสำหรับออกหนังสือรับรองการหักภาษี ณ ที่จ่าย (แบบ 50 ทวิ)
              </CardTitle>
              <CardDescription className="text-xs text-gray-500 mt-0.5">
                ข้อมูลนี้จะถูกนำไปใช้เป็น "ผู้มีหน้าที่หักภาษี ณ ที่จ่าย" บนเอกสาร 50 ทวิ และสลิปเงินเดือนทุกฉบับ
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSaveHospitalSettings} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700">
                  ชื่อโรงพยาบาล / หน่วยงาน (ภาษาไทย) <span className="text-red-500">*</span>
                </Label>
                <Input 
                  value={hospitalForm.name} 
                  onChange={e => setHospitalForm({...hospitalForm, name: e.target.value})}
                  placeholder="เช่น โรงพยาบาลสามโคก"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700">
                  ชื่อโรงพยาบาล (ภาษาอังกฤษ)
                </Label>
                <Input 
                  value={hospitalForm.nameEn} 
                  onChange={e => setHospitalForm({...hospitalForm, nameEn: e.target.value})}
                  placeholder="เช่น Samkok Hospital"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>เลขประจำตัวผู้เสียภาษีอากร 13 หลัก <span className="text-red-500">*</span></span>
                  <span className="text-[11px] font-mono text-blue-600 font-normal">
                    {hospitalForm.taxId.replace(/\D/g, "").length}/13 หลัก
                  </span>
                </Label>
                <Input 
                  value={hospitalForm.taxId} 
                  onChange={e => setHospitalForm({...hospitalForm, taxId: e.target.value})}
                  placeholder="0994000164821 (13 หลัก)"
                  maxLength={17}
                  className="font-mono font-semibold tracking-wider"
                  required
                />
                <p className="text-[11px] text-gray-500">
                  เลขประจำตัวผู้เสียภาษีอากร 13 หลักของโรงพยาบาล สำหรับใส่ในช่องสี่เหลี่ยม 13 ช่องของแบบ 50 ทวิ
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700">
                  เบอร์โทรศัพท์ติดต่อหน่วยงาน
                </Label>
                <Input 
                  value={hospitalForm.phone} 
                  onChange={e => setHospitalForm({...hospitalForm, phone: e.target.value})}
                  placeholder="เช่น 02-593-1234"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700">
                ที่อยู่ตามทะเบียนราชการ / สำนักงานใหญ่ <span className="text-red-500">*</span>
              </Label>
              <Input 
                value={hospitalForm.address} 
                onChange={e => setHospitalForm({...hospitalForm, address: e.target.value})}
                placeholder="เช่น เลขที่ 99 หมู่ 3 ถนนปทุมธานี-เสนา ตำบลสามโคก อำเภอสามโคก จังหวัดปทุมธานี 12160"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700">
                  ชื่อผู้มีอำนาจลงนาม / ผู้อำนวยการ
                </Label>
                <Input 
                  value={hospitalForm.directorName} 
                  onChange={e => setHospitalForm({...hospitalForm, directorName: e.target.value})}
                  placeholder="เช่น นายแพทย์ผู้อำนวยการโรงพยาบาลสามโคก"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700">
                  ตำแหน่งผู้มีอำนาจลงนาม
                </Label>
                <Input 
                  value={hospitalForm.directorTitle} 
                  onChange={e => setHospitalForm({...hospitalForm, directorTitle: e.target.value})}
                  placeholder="เช่น ผู้อำนวยการโรงพยาบาลสามโคก"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
                disabled={savingSettings || loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {savingSettings ? "กำลังบันทึก..." : "บันทึกข้อมูลโรงพยาบาล"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 2. Upload Logo & Official Signature */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border shadow-xs bg-white">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-sm font-bold">ตราสัญลักษณ์ / โลโก้โรงพยาบาล</CardTitle>
            </div>
            <CardDescription className="text-xs text-gray-500">
              ใช้แสดงผลที่ส่วนหัวของสลิปเงินเดือน รายงาน และเอกสารทางการเงิน
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">เลือกไฟล์โลโก้ (.png, .jpg)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
            </div>
            <Button 
              className="bg-[#1877f2] hover:bg-[#166fe5] w-full text-xs" 
              onClick={() => handleUpload('logo')} 
              disabled={!logo || uploading}
            >
              อัปโหลดโลโก้ใหม่
            </Button>
            <div className="pt-2 border-t">
              <p className="text-xs font-bold text-gray-600 mb-2">โลโก้ปัจจุบันที่ใช้ในระบบ:</p>
              <div className="h-24 bg-gray-50 rounded-lg border border-dashed flex items-center justify-center p-2">
                <img 
                  src={`${API_URL}/settings/logo`} 
                  alt="Logo" 
                  className="max-h-full object-contain" 
                  onError={(e) => {
                    e.currentTarget.src = "/logo.jpg";
                  }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs bg-white">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-indigo-600" />
              <CardTitle className="text-sm font-bold">ลายเซ็นดิจิทัลผู้อนุมัติ / ฝ่ายการเงิน</CardTitle>
            </div>
            <CardDescription className="text-xs text-gray-500">
              ใช้ประทับท้ายสลิปเงินเดือนและเอกสารสรุปยอดค่าใช้จ่าย
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">เลือกไฟล์ลายเซ็นพื้นหลังโปร่งใส (.png)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setSignature(e.target.files?.[0] || null)} />
            </div>
            <Button 
              className="bg-[#1877f2] hover:bg-[#166fe5] w-full text-xs" 
              onClick={() => handleUpload('signature')} 
              disabled={!signature || uploading}
            >
              อัปโหลดลายเซ็นใหม่
            </Button>
            <div className="pt-2 border-t">
              <p className="text-xs font-bold text-gray-600 mb-2">ลายเซ็นปัจจุบัน:</p>
              <div className="h-24 bg-gray-50 rounded-lg border border-dashed flex items-center justify-center p-2">
                <img 
                  src={`${API_URL}/settings/signature`} 
                  alt="Signature" 
                  className="max-h-full object-contain" 
                  onError={(e) => (e.currentTarget.style.display = 'none')} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
