import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardHome() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">แดชบอร์ดภาพรวม</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">พนักงานทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">รอประมวลผล (เดือนนี้)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">สถานะล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">ปกติ</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
