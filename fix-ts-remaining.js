const fs = require('fs');

// time-tracking.ts
let c1 = fs.readFileSync('src/actions/time-tracking.ts', 'utf-8');
c1 = c1.replace(/if \(user\?\.branch\) \{[\s\S]*?\}/, ''); // Remove the if branch check in settings
c1 = c1.replace(/const timezone = user\.branch\?\.timezone \|\| "Asia\/Bangkok";/g, 'const timezone = "Asia/Singapore";');
fs.writeFileSync('src/actions/time-tracking.ts', c1);

// users.ts
let c2 = fs.readFileSync('src/actions/users.ts', 'utf-8');
c2 = c2.replace(/branchId: data\.branchId,/g, ''); // Remove branchId from update
fs.writeFileSync('src/actions/users.ts', c2);

// app/admin/page.tsx
let c3 = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');
c3 = c3.replace(/import \{ getAdminLogs, getAdminMonthlyLogs, updateCompanySettings, getAdminBranches, updateAdminBranch \} from "@\/actions\/admin";/, 'import { getAdminLogs, getAdminMonthlyLogs, updateCompanySettings } from "@/actions/admin";');
fs.writeFileSync('src/app/admin/page.tsx', c3);
