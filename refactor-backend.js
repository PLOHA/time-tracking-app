const fs = require('fs');

// time-tracking.ts
let c1 = fs.readFileSync('src/actions/time-tracking.ts', 'utf-8');
c1 = c1.replace(/include: \{ branch: true \}/g, '');
c1 = c1.replace(/const tz = user\.branch\?\.timezone \|\| "Asia\/Bangkok";/g, 'const tz = "Asia/Singapore";');
c1 = c1.replace(/user\.branch\?\.lat/g, 'settings?.companyLat');
c1 = c1.replace(/user\.branch\?\.lng/g, 'settings?.companyLng');
fs.writeFileSync('src/actions/time-tracking.ts', c1);

// users.ts
let c2 = fs.readFileSync('src/actions/users.ts', 'utf-8');
c2 = c2.replace(/branchId: true,\s*branch: \{ select: \{ name: true, timezone: true \} \}/g, '');
c2 = c2.replace(/branchId\s*:\s*data\.branchId,/g, '');
fs.writeFileSync('src/actions/users.ts', c2);

// timezone.ts
let c3 = fs.readFileSync('src/lib/timezone.ts', 'utf-8');
c3 = c3.replace(/return getMidnightUTCForTimezone\(tz\);/g, 'return getMidnightUTCForTimezone("Asia/Singapore");');
fs.writeFileSync('src/lib/timezone.ts', c3);
