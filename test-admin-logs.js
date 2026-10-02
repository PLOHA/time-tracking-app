const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calculateLateness(clockInTime, shiftType, timezone = 'Asia/Bangkok') {
  if (!clockInTime) return { isLate: false, minutesLate: 0, text: "-" };
  const time = new Date(clockInTime);
  let expectedHour = 8;
  if (shiftType === "OFFICE") expectedHour = 8;
  else if (shiftType === "SHIFT_MORNING") expectedHour = 6;
  else if (shiftType === "SHIFT_NIGHT") expectedHour = 18;

  const getOffsetMs = (date, tz) => {
    const tzString = date.toLocaleString('en-US', { timeZone: tz });
    const utcString = date.toLocaleString('en-US', { timeZone: 'UTC' });
    return new Date(tzString).getTime() - new Date(utcString).getTime();
  };
  const offsetMs = getOffsetMs(time, timezone);
  const localTimeMs = time.getTime() + offsetMs;
  const expectedLocalDate = new Date(localTimeMs);
  expectedLocalDate.setUTCHours(expectedHour, 0, 0, 0);

  if (localTimeMs > expectedLocalDate.getTime()) {
    const diffMs = localTimeMs - expectedLocalDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return { isLate: diffMins > 0, minutesLate: diffMins, text: diffMins === 0 ? 'ตรงเวลา' : `สาย ${diffMins} นาที` };
  } else {
    const diffMs = expectedLocalDate.getTime() - localTimeMs;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return { isLate: false, minutesLate: diffMins, text: diffMins === 0 ? 'ตรงเวลา' : `ก่อนเวลา ${diffMins} นาที` };
  }
}

async function run() {
  const logs = await prisma.timeLog.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          shiftType: true,
          branch: { select: { timezone: true } }
        }
      }
    },
    orderBy: { clockInTime: 'desc' }
  });

  logs.forEach(log => {
    const tz = log.user.branch?.timezone || "Asia/Bangkok";
    const res = calculateLateness(log.clockInTime, log.user.shiftType, tz);
    console.log(log.user.name, "| ClockIn:", log.clockInTime, "| TZ:", tz, "| Result:", res);
  });
}
run();
