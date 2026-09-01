const fs = require('fs');

const file = 'src/app/dashboard/layout.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldNavItems = `const navItems = [
    { name: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
    { name: "พนักงาน", href: "/dashboard/employees", icon: Users },
    { name: "ประเภทพนักงาน", href: "/dashboard/employee-types", icon: FolderKanban },
    { name: "ตำแหน่ง", href: "/dashboard/positions", icon: Briefcase },
    { name: "ตั้งค่ารายรับ/รายจ่าย", href: "/dashboard/pay-items", icon: Settings },
    { name: "ประมวลผลเงินเดือน", href: "/dashboard/payroll", icon: Calculator },
    { name: "ตั้งค่าระบบ (อัปโหลดภาพ)", href: "/dashboard/settings", icon: Settings },
  ];`;

const newNavItems = `const navItems = [
    { name: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
    { name: "ผู้ใช้งาน", href: "/dashboard/users", icon: Users },
    { name: "พนักงาน", href: "/dashboard/employees", icon: Users },
    { name: "ประเภทพนักงาน", href: "/dashboard/employee-types", icon: FolderKanban },
    { name: "ตำแหน่ง", href: "/dashboard/positions", icon: Briefcase },
    { name: "ตั้งค่ารายรับ/รายจ่าย", href: "/dashboard/pay-items", icon: Settings },
    { name: "ประมวลผลเงินเดือน", href: "/dashboard/payroll", icon: Calculator },
    { name: "ตั้งค่าระบบ (อัปโหลดภาพ)", href: "/dashboard/settings", icon: Settings },
  ];`;

content = content.replace(oldNavItems, newNavItems);

fs.writeFileSync(file, content);
