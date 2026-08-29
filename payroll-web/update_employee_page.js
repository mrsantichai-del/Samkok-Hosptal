const fs = require('fs');

const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Imports for Combobox (Popover + Command + Check + ChevronsUpDown)
if (!content.includes('lucide-react')) {
  // It includes lucide-react already, but we need Check and ChevronsUpDown
  content = content.replace('Search, Plus, Edit, Trash2', 'Search, Plus, Edit, Trash2, Check, ChevronsUpDown');
} else if (!content.includes('ChevronsUpDown')) {
  content = content.replace('Search, Plus, Edit, Trash2', 'Search, Plus, Edit, Trash2, Check, ChevronsUpDown');
}

if (!content.includes('@/components/ui/popover')) {
  content = content.replace(
    'import { Select',
    `import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Select`
  );
}

// 2. Add new states
const stateInjection = `  const [idCard, setIdCard] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeTypeId, setEmployeeTypeId] = useState("unassigned");
  const [positionId, setPositionId] = useState("unassigned");
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPositionId, setFilterPositionId] = useState("all");
  const [filterTypeId, setFilterTypeId] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Combobox Open States
  const [openPos, setOpenPos] = useState(false);
  const [openType, setOpenType] = useState(false);

  // Derived filtered list
  const filteredEmployees = employees.filter(emp => {
    const matchSearch = emp.firstName.includes(searchTerm) || emp.lastName.includes(searchTerm) || emp.employeeCode.includes(searchTerm);
    const matchPos = filterPositionId === "all" || emp.positionId === filterPositionId;
    const matchType = filterTypeId === "all" || emp.employeeTypeId === filterTypeId;
    const matchStatus = filterStatus === "all" || (filterStatus === "active" ? !emp.resignedDate : !!emp.resignedDate);
    return matchSearch && matchPos && matchType && matchStatus;
  });
`;
content = content.replace(/  const \[idCard, setIdCard\] = useState\(""\);\s+const \[employeeTypeId, setEmployeeTypeId\] = useState\("unassigned"\);\s+const \[positionId, setPositionId\] = useState\("unassigned"\);/, stateInjection);


// 3. Update openAddDialog & openEditDialog
const openAddOriginal = `  const openAddDialog = () => {
    setEditingItem(null);
    setFirstName("");
    setLastName("");
    setIdCard("");
    setEmployeeTypeId("unassigned");
    setPositionId("unassigned");
    setIsDialogOpen(true);
  };`;
const openAddUpdated = `  const openAddDialog = () => {
    setEditingItem(null);
    setEmployeeCode("");
    setFirstName("");
    setLastName("");
    setIdCard("");
    setEmployeeTypeId("unassigned");
    setPositionId("unassigned");
    setIsDialogOpen(true);
  };`;
content = content.replace(openAddOriginal, openAddUpdated);

const openEditOriginal = `  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setFirstName(item.firstName);
    setLastName(item.lastName);
    setIdCard(item.idCard || "");
    setEmployeeTypeId(item.employeeTypeId || "unassigned");
    setPositionId(item.positionId || "unassigned");
    setIsDialogOpen(true);
  };`;
const openEditUpdated = `  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setEmployeeCode(item.employeeCode || "");
    setFirstName(item.firstName);
    setLastName(item.lastName);
    setIdCard(item.idCard || "");
    setEmployeeTypeId(item.employeeTypeId || "unassigned");
    setPositionId(item.positionId || "unassigned");
    setIsDialogOpen(true);
  };`;
content = content.replace(openEditOriginal, openEditUpdated);


// 4. Update handleSave payload
const payloadOriginal = `        const payload = {
          firstName,
          lastName,
          idCard: idCard === "" ? null : idCard,
          employeeTypeId: employeeTypeId === "unassigned" ? null : employeeTypeId,
          positionId: positionId === "unassigned" ? null : positionId,
        };`;
const payloadUpdated = `        const payload = {
          employeeCode: employeeCode === "" ? undefined : employeeCode,
          firstName,
          lastName,
          idCard: idCard === "" ? null : idCard,
          employeeTypeId: employeeTypeId === "unassigned" ? null : employeeTypeId,
          positionId: positionId === "unassigned" ? null : positionId,
        };`;
content = content.replace(payloadOriginal, payloadUpdated);


// 5. Update Grid Filters (search bar header)
const filterGridOriginal = `<div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="ค้นหาชื่อพนักงาน..." 
              className="pl-9 bg-[#f0f2f5] border-none"
            />
          </div>`;
const filterGridUpdated = `<div className="flex gap-4 flex-wrap">
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
          </div>`;
content = content.replace(filterGridOriginal, filterGridUpdated);


// 6. Update mapping to filteredEmployees
content = content.replace('employees.length === 0', 'filteredEmployees.length === 0');
content = content.replace('employees.map((emp) => (', 'filteredEmployees.map((emp) => (');


// 7. Update Add/Edit Form UI
const formGridOriginal = `<div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">ชื่อ</Label>`;
const formGridUpdated = `<div className="space-y-2">
              <Label htmlFor="employeeCode">รหัสพนักงาน</Label>
              <Input id="employeeCode" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} placeholder="ถ้าปล่อยว่างระบบจะสร้างให้ (EMP-xxxxxx)" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">ชื่อ</Label>`;
content = content.replace(formGridOriginal, formGridUpdated);

const positionSelectOriginal = `<Select value={positionId} onValueChange={setPositionId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกตำแหน่ง" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">ไม่ระบุ</SelectItem>
                  {positions.map(pos => (
                    <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>`;
const positionCombobox = `<Popover open={openPos} onOpenChange={setOpenPos}>
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
              </Popover>`;
content = content.replace(positionSelectOriginal, positionCombobox);


const typeSelectOriginal = `<Select value={employeeTypeId} onValueChange={setEmployeeTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทพนักงาน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">ไม่ระบุ</SelectItem>
                  {employeeTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>`;
const typeCombobox = `<Popover open={openType} onOpenChange={setOpenType}>
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
              </Popover>`;
content = content.replace(typeSelectOriginal, typeCombobox);

// Update Status label logic
// "ทำงาน" -> emp.resignedDate ? "ลาออก" : "ทำงาน"
content = content.replace(
  '<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">\n                      ทำงาน\n                    </span>',
  `{emp.resignedDate ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ลาออก
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ทำงาน
                      </span>
                    )}`
);

fs.writeFileSync(file, content);
