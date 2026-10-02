const fs = require('fs');

function fixTz(file) {
  let c = fs.readFileSync(file, 'utf-8');
  c = c.replace(/toLocaleTimeString\('th-TH'\)/g, "toLocaleTimeString('en-US', { timeZone: 'Asia/Singapore', hour12: false })");
  c = c.replace(/toLocaleTimeString\('th-TH', \{/g, "toLocaleTimeString('en-US', { timeZone: 'Asia/Singapore', hour12: false,");
  fs.writeFileSync(file, c);
}

fixTz('src/app/admin/page.tsx');
fixTz('src/app/dashboard/page.tsx');
