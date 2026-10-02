const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

c = c.replace(/!log\.user\.branch\?\.name\.includes/g, '!log.user.branch?.name?.includes');
c = c.replace(/!u\.branch\?\.name\.includes/g, '!u.branch?.name?.includes');
c = c.replace(/log\.user\.branch\?\.name\.includes/g, 'log.user.branch?.name?.includes');

fs.writeFileSync('src/app/admin/page.tsx', c);
