const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf-8');
c = c.replace(/"Asia\/Bangkok"/g, '"Asia/Singapore"');
fs.writeFileSync('src/app/dashboard/page.tsx', c);
