const fs = require('fs');
if (fs.existsSync('update-branches.ts')) fs.unlinkSync('update-branches.ts');
if (fs.existsSync('prisma/seed-branches.ts')) fs.unlinkSync('prisma/seed-branches.ts');

let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');
c = c.replace(/getAdminBranches,\s*updateAdminBranch\s*\} from "@\/actions\/admin"/g, '} from "@/actions/admin"');
fs.writeFileSync('src/app/admin/page.tsx', c);

let c2 = fs.readFileSync('src/actions/users.ts', 'utf-8');
c2 = c2.replace(/branchId: data\.branchId,/g, '');
fs.writeFileSync('src/actions/users.ts', c2);
