const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

c = c.replace(/import \{ getAdminLogs, getAdminMonthlyLogs, updateCompanySettings, getAdminBranches, updateAdminBranch \} from "@\/actions\/admin";/, 
  'import { getAdminLogs, getAdminMonthlyLogs, updateCompanySettings } from "@/actions/admin";\nconst getAdminBranches = async () => [];\nconst updateAdminBranch = async (a:any, b:any) => {};');

c = c.replace(/log\.user\.branch/g, '(log.user as any).branch');
c = c.replace(/u\.branch/g, '(u as any).branch');
c = c.replace(/branchId: formData\.branchId \|\| null/g, '');
c = c.replace(/branchId: editFormData\.branchId/g, '/* */');

c = c.replace(/const \[formData, setFormData\] = useState\(\{[\s\S]*?\}\);/g, `const [formData, setFormData] = useState({
    name: "", email: "", passwordRaw: "", shiftType: "OFFICE" as any, cycleStartDate: "", branchId: "" as any
  });`);

c = c.replace(/const \[editFormData, setEditFormData\] = useState\(\{[\s\S]*?\}\);/g, `const [editFormData, setEditFormData] = useState({ name: "", shiftType: "OFFICE" as any, cycleStartDate: "", branchId: "" as any });`);

fs.writeFileSync('src/app/admin/page.tsx', c);
