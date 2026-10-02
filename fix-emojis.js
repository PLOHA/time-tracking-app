const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

c = c.replace(/\?\?\?\? TH/g, '🇹🇭 TH');
c = c.replace(/\?\?\?\? SG/g, '🇸🇬 SG');

fs.writeFileSync('src/app/admin/page.tsx', c);
