const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf-8');

c = c.replaceAll(
`const { isLate, minutesLate } = calculateLateness(todayLog.clockInTime, todayLog?.user?.shiftType || (session?.user as any)?.shiftType || "OFFICE");`,
`const { isLate, minutesLate } = calculateLateness(todayLog.clockInTime, todayLog?.user?.shiftType || (session?.user as any)?.shiftType || "OFFICE", companySettings?.timezone);`
);

c = c.replaceAll(
`const { isLate } = calculateLateness(log.clockInTime, log.user.shiftType);`,
`const { isLate } = calculateLateness(log.clockInTime, log.user.shiftType, companySettings?.timezone);`
);

c = c.replaceAll(
`const { isLate, minutesLate } = calculateLateness(selectedLog.clockInTime, selectedLog.user.shiftType);`,
`const { isLate, minutesLate } = calculateLateness(selectedLog.clockInTime, selectedLog.user.shiftType, companySettings?.timezone);`
);

fs.writeFileSync('src/app/dashboard/page.tsx', c);
