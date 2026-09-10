const fs = require('fs');
let file = 'src/app/dashboard/layout.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports
const newImports = `
import axios from "axios";
import { API_URL } from "@/lib/config";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";
import { th } from "date-fns/locale";
`;
content = content.replace('import { Button } from "@/components/ui/button";', newImports + 'import { Button } from "@/components/ui/button";');

// 2. Add state and fetch logic
const logic = `
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;
      const res = await axios.get(\`\${API_URL}/users/my-notifications\`, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      setNotifications(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      const token = Cookies.get("token");
      await axios.patch(\`\${API_URL}/users/notifications/read-all\`, {}, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      setNotifications([]);
      setShowNotifications(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Poll every minute
      return () => clearInterval(interval);
    }
  }, [user]);
`;

content = content.replace('const [user, setUser] = useState<any>(null);', 'const [user, setUser] = useState<any>(null);\n' + logic);

// 3. Replace the Bell button
const newBell = `
            {notifications.length > 0 && (
              <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] w-10 h-10">
                    <Bell className="h-5 w-5 text-black" />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 mr-4 mt-2" align="end">
                  <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold">การแจ้งเตือน ({notifications.length})</h3>
                    <button onClick={markAllRead} className="text-xs text-[#1877f2] hover:underline">อ่านทั้งหมด</button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">ไม่มีการแจ้งเตือนใหม่</div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-4 border-b hover:bg-gray-50 cursor-pointer">
                          <div className="font-semibold text-sm">{notif.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{notif.message}</div>
                          <div className="text-xs text-gray-400 mt-2">
                            {format(new Date(notif.createdAt), "d MMM yyyy HH:mm", { locale: th })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
`;

content = content.replace(
  '<Button variant="ghost" size="icon" className="rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] w-10 h-10">\n              <Bell className="h-5 w-5 text-black" />\n            </Button>',
  newBell
);

fs.writeFileSync(file, content);
console.log('Updated layout.tsx');
