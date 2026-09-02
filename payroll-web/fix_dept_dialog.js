const fs = require('fs');

const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix openEditDialog
if (!content.includes('setDepartmentId(item.departmentId || "unassigned");')) {
  content = content.replace(
    'setPositionId(item.positionId || "unassigned");',
    'setPositionId(item.positionId || "unassigned");\n    setDepartmentId(item.departmentId || "unassigned");'
  );
}

// 2. Insert JSX for Department dropdown before Position dropdown
const positionJsxStart = '<div className="space-y-2">\n              <Label>ตำแหน่ง</Label>';

const deptJsx = `<div className="space-y-2">
              <Label>แผนก</Label>
              <Popover open={openDept} onOpenChange={setOpenDept}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={openDept} className="w-full justify-between">
                    {departmentId === "unassigned" ? "ไม่ระบุ" : departments.find(d => d.id === departmentId)?.name || "เลือกแผนก..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[380px] p-0" style={{ zIndex: 99999 }}>
                  <Command>
                    <CommandInput placeholder="ค้นหาแผนก..." />
                    <CommandEmpty>ไม่พบแผนก</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        <CommandItem onSelect={() => { setDepartmentId("unassigned"); setOpenDept(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", departmentId === "unassigned" ? "opacity-100" : "opacity-0")} />
                          ไม่ระบุ
                        </CommandItem>
                        {departments.map(dept => (
                          <CommandItem key={dept.id} onSelect={() => { setDepartmentId(dept.id); setOpenDept(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", departmentId === dept.id ? "opacity-100" : "opacity-0")} />
                            {dept.name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>\n\n            `;

if (!content.includes('<Label>แผนก</Label>') && content.includes(positionJsxStart)) {
  content = content.replace(positionJsxStart, deptJsx + positionJsxStart);
  fs.writeFileSync(file, content);
  console.log('Fixed dialog missing department field');
} else {
  if (content.includes('<Label>แผนก</Label>')) {
    console.log('Already has department field');
  } else {
    console.log('Could not find position block to insert before');
  }
}
