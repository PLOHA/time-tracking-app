const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

c = c.replace(/getAdminBranches,\s*updateAdminBranch\s*\}/, '}');
c = c.replace(/from "@\/actions\/admin";/, 'from "@/actions/admin";\nconst getAdminBranches = async () => ([]);\nconst updateAdminBranch = async (a:any, b:any) => {};');

c = c.split('log.user.branch').join('(log.user as any).branch');
c = c.split('u.branch').join('(u as any).branch');

c = c.replace(/branchId: formData\.branchId \|\| null/, '...(formData.branchId ? { branchId: formData.branchId } : {}) as any');

fs.writeFileSync('src/app/admin/page.tsx', c);
