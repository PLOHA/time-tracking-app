const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

c = c.replace(/import \{ getAdminLogs, getAdminMonthlyLogs, updateCompanySettings, getAdminBranches, updateAdminBranch \} from "@\/actions\/admin";/, 
  'import { getAdminLogs, getAdminMonthlyLogs, updateCompanySettings } from "@/actions/admin";\nconst getAdminBranches = async () => [];\nconst updateAdminBranch = async () => {};');

c = c.replace(/log\.user\.branch/g, '(log.user as any).branch');
c = c.replace(/u\.branch/g, '(u as any).branch');

fs.writeFileSync('src/app/admin/page.tsx', c);
