const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');
c = c.replace(/"Asia\/Bangkok"/g, '"Asia/Singapore"');
fs.writeFileSync('src/app/admin/page.tsx', c);
