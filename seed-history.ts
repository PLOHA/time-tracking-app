import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
  if (!user) return;

  const logs = [];
  
  for (let day = 1; day <= 30; day++) {
    const date = new Date(2026, 8, day); // Month is 0-indexed, 8 = September
    const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
    
    // Skip weekends for OFFICE shift
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    let inHour = 7;
    let inMinute = Math.floor(Math.random() * 30) + 30; // 07:30 to 07:59 (On time)
    let outHour = 17;
    let outMinute = Math.floor(Math.random() * 30) + 5; // 17:05 to 17:34
    
    let inFlag = false;
    let outFlag = false;
    
    // Make 3 days late
    if (day === 4 || day === 15 || day === 22) {
       inHour = 8;
       inMinute = Math.floor(Math.random() * 45) + 5; // 08:05 to 08:50 (Late)
    }
    
    // Make 2 days out of bounds
    if (day === 9 || day === 18) {
       inFlag = true;
    }
    
    const clockInTime = new Date(2026, 8, day, inHour, inMinute);
    const clockOutTime = (day === 28) ? null : new Date(2026, 8, day, outHour, outMinute); // Missing clockout on 28th

    logs.push({
      userId: user.id,
      recordDate: new Date(2026, 8, day, 0, 0, 0),
      clockInTime: clockInTime,
      clockInLat: 13.7563,
      clockInLng: 100.5018,
      clockInFlagged: inFlag,
      clockOutTime: clockOutTime,
      clockOutLat: clockOutTime ? 13.7563 : null,
      clockOutLng: clockOutTime ? 100.5018 : null,
      clockOutFlagged: outFlag
    });
  }

  // Clear old Sep logs just in case
  const startSep = new Date(2026, 8, 1);
  const endSep = new Date(2026, 8, 30, 23, 59, 59);
  await prisma.timeLog.deleteMany({
    where: { userId: user.id, recordDate: { gte: startSep, lte: endSep } }
  });

  await prisma.timeLog.createMany({ data: logs });
  console.log('Inserted ' + logs.length + ' logs for September 2026');
}

main().finally(() => prisma.$disconnect());
