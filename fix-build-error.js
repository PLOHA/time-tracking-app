const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf-8');

c = c.replaceAll('companySettings?.timezone', 'settings?.timezone');

fs.writeFileSync('src/app/dashboard/page.tsx', c);
