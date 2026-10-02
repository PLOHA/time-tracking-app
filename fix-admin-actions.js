const fs = require('fs');
let c = fs.readFileSync('src/actions/admin.ts', 'utf-8');

c = c.replace(/if \(settings && log\.clockInLat && log\.clockInLng\) \{\s*distanceIn = calcDistance\(log\.clockInLat, log\.clockInLng, settings\.companyLat, settings\.companyLng\);\s*\}/g, 
`if (log.clockInLat && log.clockInLng && log.user.branch) {
        distanceIn = calcDistance(log.clockInLat, log.clockInLng, log.user.branch.lat, log.user.branch.lng);
      }`);

c = c.replace(/if \(settings && log\.clockOutLat && log\.clockOutLng\) \{\s*distanceOut = calcDistance\(log\.clockOutLat, log\.clockOutLng, settings\.companyLat, settings\.companyLng\);\s*\}/g, 
`if (log.clockOutLat && log.clockOutLng && log.user.branch) {
        distanceOut = calcDistance(log.clockOutLat, log.clockOutLng, log.user.branch.lat, log.user.branch.lng);
      }`);

fs.writeFileSync('src/actions/admin.ts', c);
