const fs = require('fs');
let c = fs.readFileSync('src/actions/admin.ts', 'utf-8');

c = c.replace(/select: \{ timezone: true, lat: true, lng: true \}/g, `select: { name: true, timezone: true, lat: true, lng: true }`);

fs.writeFileSync('src/actions/admin.ts', c);
