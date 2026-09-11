"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Payroll Detail Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="bg-red-50 p-4 rounded-full mb-4 border border-red-200">
        <AlertCircle className="w-10 h-10 text-red-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาดในการโหลดหน้านี้</h2>
      <p className="text-sm text-red-600 font-mono bg-red-50 border border-red-200 p-3 rounded-md max-w-lg mb-4 break-all text-left">
        {error?.name}: {error?.message || "Unknown error"}
      </p>
      {error?.digest && (
        <p className="text-xs text-gray-400 mb-4">Error Digest: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/dashboard/payroll")}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> กลับหน้ารายการเงินเดือน
        </Button>
        <Button className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={() => reset()}>
          <RotateCcw className="w-4 h-4 mr-1.5" /> ลองใหม่อีกครั้ง
        </Button>
      </div>
    </div>
  );
}
