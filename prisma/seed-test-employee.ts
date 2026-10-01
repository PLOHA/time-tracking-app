import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "test@example.com" }
  });

  if (!user) {
    console.log("Test Employee not found");
    return;
  }

  // Generate logs for September 2026
  const year = 2026;
  const month = 9; // September
  const daysInMonth = 30;

  let count = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    // Skip weekends
    const date = new Date(year, month - 1, day);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const clockIn = new Date(year, month - 1, day, 7, 45 + Math.floor(Math.random() * 15));
    const clockOut = new Date(year, month - 1, day, 17, Math.floor(Math.random() * 60));

    await prisma.timeLog.create({
      data: {
        userId: user.id,
        recordDate: new Date(year, month - 1, day, 0, 0, 0, 0),
        clockInTime: clockIn,
        clockInLat: 13.7563 + (Math.random() - 0.5) * 0.0001,
        clockInLng: 100.5018 + (Math.random() - 0.5) * 0.0001,
        clockInFlagged: Math.random() > 0.9,
        clockOutTime: clockOut,
        clockOutLat: 13.7563 + (Math.random() - 0.5) * 0.0001,
        clockOutLng: 100.5018 + (Math.random() - 0.5) * 0.0001,
        clockOutFlagged: false
      }
    });
    count++;
  }

  console.log(`Created ${count} logs for Test Employee`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
