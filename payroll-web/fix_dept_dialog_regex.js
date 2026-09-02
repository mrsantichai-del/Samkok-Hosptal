const fs = require('fs');

const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Use Regex to handle \r\n
const positionJsxStartRegex = /<div className="space-y-2">\s*<Label>ตำแหน่ง<\/Label>/;

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
            </div>

            <div className="space-y-2">
              <Label>ตำแหน่ง</Label>`;

if (content.match(positionJsxStartRegex)) {
  content = content.replace(positionJsxStartRegex, deptJsx);
  
  // 1. Fix openEditDialog
  if (!content.includes('setDepartmentId(item.departmentId || "unassigned");')) {
    content = content.replace(
      'setPositionId(item.positionId || "unassigned");',
      'setPositionId(item.positionId || "unassigned");\n    setDepartmentId(item.departmentId || "unassigned");'
    );
  }

  fs.writeFileSync(file, content);
  console.log('Fixed dialog successfully');
} else {
  console.log('Regex did not match');
}
