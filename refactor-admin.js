const fs = require('fs');
let c = fs.readFileSync('src/actions/admin.ts', 'utf-8');

// Remove branch from prisma includes
c = c.replace(/branch: \{\s*select: \{ name: true, timezone: true, lat: true, lng: true \}\s*\}/g, '');

// Replace distance logic
c = c.replace(/if \(log\.clockInLat && log\.clockInLng && log\.user\.branch\) \{[\s\S]*?calcDistance\(log\.clockInLat, log\.clockInLng, log\.user\.branch\.lat, log\.user\.branch\.lng\);\s*\}/g, `if (log.clockInLat && log.clockInLng && settings) {
        distanceIn = calcDistance(log.clockInLat, log.clockInLng, settings.companyLat, settings.companyLng);
      }`);

c = c.replace(/if \(log\.clockOutLat && log\.clockOutLng && log\.user\.branch\) \{[\s\S]*?calcDistance\(log\.clockOutLat, log\.clockOutLng, log\.user\.branch\.lat, log\.user\.branch\.lng\);\s*\}/g, `if (log.clockOutLat && log.clockOutLng && settings) {
        distanceOut = calcDistance(log.clockOutLat, log.clockOutLng, settings.companyLat, settings.companyLng);
      }`);

// Fix timezone fallback
c = c.replace(/const tz = log\.user\.branch\?\.timezone \|\| "Asia\/Bangkok";/g, 'const tz = "Asia/Singapore";');

// Remove branch exports
c = c.replace(/export async function getAdminBranches\(\) \{[\s\S]*?\}\s*export async function createAdminBranch[\s\S]*?\}\s*export async function updateAdminBranch[\s\S]*?\}/, '');

fs.writeFileSync('src/actions/admin.ts', c);
