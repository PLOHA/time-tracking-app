const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

c = c.replace(/branchId: formData.branchId/g, '/* */');
c = c.replace(/branchId: editFormData.branchId/g, '/* */');
c = c.replace(/value=\{formData\.branchId\}/g, '/* */');
c = c.replace(/value=\{editFormData\.branchId\}/g, '/* */');
c = c.replace(/updateAdminBranch\(editingBranchId, \{\n[\s\S]*?\}\)/, 'updateAdminBranch()');

fs.writeFileSync('src/app/admin/page.tsx', c);
