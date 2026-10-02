const fs = require('fs');

let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

c = c.replaceAll(
`const { isLate, minutesLate } = calculateLateness(log.clockInTime, log.user.shiftType);`,
`const { isLate, minutesLate } = calculateLateness(log.clockInTime, log.user.shiftType, log.user.branch?.timezone || "Asia/Bangkok");`
);

fs.writeFileSync('src/app/admin/page.tsx', c);
