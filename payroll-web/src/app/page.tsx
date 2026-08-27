"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import Cookies from "js-cookie";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        username,
        password,
      });

      const token = response.data.access_token;
      Cookies.set("token", token, { expires: 1 }); // Save token to cookies
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "เข้าสู่ระบบไม่สำเร็จ โปรดตรวจสอบรหัสผ่าน");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="grid md:grid-cols-2 gap-10 max-w-5xl w-full">
        {/* Left Side - Brand */}
        <div className="flex flex-col justify-center space-y-4">
          <h1 className="text-[3.5rem] font-bold text-[#1877f2] leading-none tracking-tight">Samkok Payroll</h1>
          <p className="text-2xl text-gray-700 leading-snug">
            ระบบจัดการเงินเดือนและค่าตอบแทน
            <br />
            โรงพยาบาลสามโคก
          </p>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-col items-center justify-center">
          <Card className="w-full max-w-md shadow-lg border-none rounded-xl">
            <CardContent className="pt-6 space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">{error}</div>}
                
                <Input 
                  type="text" 
                  placeholder="รหัสพนักงาน หรือ Username" 
                  className="h-[52px] text-lg focus-visible:ring-[#1877f2]"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <Input 
                  type="password" 
                  placeholder="รหัสผ่าน" 
                  className="h-[52px] text-lg focus-visible:ring-[#1877f2]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full h-[48px] text-xl font-bold bg-[#1877f2] hover:bg-[#166fe5] text-white"
                  disabled={loading}
                >
                  {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </Button>
              </form>
              <div className="text-center pt-2">
                <a href="#" className="text-[#1877f2] hover:underline text-sm font-medium">ลืมรหัสผ่านใช่หรือไม่?</a>
              </div>
              <div className="border-b border-gray-300 my-4"></div>
              <div className="flex justify-center">
                <Button type="button" className="bg-[#42b72a] hover:bg-[#36a420] text-white font-bold h-[48px] px-6 text-[17px]">
                  ลงทะเบียนผู้ใช้ใหม่
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="mt-7 text-sm text-gray-600 text-center">
            <b>สำหรับเจ้าหน้าที่โรงพยาบาลเท่านั้น</b>
          </div>
        </div>
      </div>
    </main>
  );
}
