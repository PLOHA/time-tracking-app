const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

c = c.replace(/branchId: formData\.branchId \|\| null/g, '');
c = c.replace(/branchId: ""/g, '');
c = c.replace(/branchId: e\.target\.value/g, '');

c = c.replace(/updateAdminBranch\(editingBranchId, \{\n[\s\S]*?\}\)/, 'updateAdminBranch()');

fs.writeFileSync('src/app/admin/page.tsx', c);
