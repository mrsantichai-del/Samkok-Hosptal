const fs = require('fs');

const file = 'src/app/dashboard/layout.tsx';
let content = fs.readFileSync(file, 'utf8');

const anchor = '{ name: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },';
if (content.includes(anchor)) {
    content = content.replace(
        anchor,
        anchor + '\n    { name: "ผู้ใช้งาน", href: "/dashboard/users", icon: Users },'
    );
    fs.writeFileSync(file, content);
    console.log("Replaced successfully!");
} else {
    console.log("Could not find the anchor text.");
}
