const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

c = c.replace(/.*if \(branchFilter === "SG".*\n/g, '');
c = c.replace(/.*log\.user\.branch\?\.name\?\.includes.*\n/g, '');

fs.writeFileSync('src/app/admin/page.tsx', c);
