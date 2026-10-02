const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

c = c.replace(/getAdminBranches,\s*updateAdminBranch\s*\} from "@\/actions\/admin";/, '} from "@/actions/admin";\nconst getAdminBranches = async () => [];\nconst updateAdminBranch = async () => {};');

c = c.replace(/branchId: newUser\.branchId/g, '/* branchId: newUser.branchId */');

fs.writeFileSync('src/app/admin/page.tsx', c);
