const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() {
  console.log("Cleaning up...");
  await prisma.timeLog.deleteMany({});
  await prisma.user.deleteMany({ where: { role: 'EMPLOYEE' } });

  const sgBranch = await prisma.branch.findFirst({ where: { name: 'Seagate Woodlands SG' } });
  const thBranch = await prisma.branch.findFirst({ where: { name: 'Seagate Korat TH' } });

  const pw = await bcrypt.hash('password123', 10);

  console.log("Creating new employees...");
  
  // Create 3 Thai Employees
  const thUsers = [];
  for(let i=1; i<=3; i++) {
    thUsers.push(await prisma.user.create({
      data: {
        name: `Thai Employee ${i}`,
        email: `thai${i}@example.com`,
        passwordHash: pw,
        role: "EMPLOYEE",
        shiftType: i === 1 ? "OFFICE" : (i === 2 ? "SHIFT_MORNING" : "SHIFT_NIGHT"),
        branchId: thBranch.id
      }
    }));
  }

  // Create 2 SG Employees
  const sgUsers = [];
  for(let i=1; i<=2; i++) {
    sgUsers.push(await prisma.user.create({
      data: {
        name: `SG Employee ${i}`,
        email: `sg${i}@example.com`,
        passwordHash: pw,
        role: "EMPLOYEE",
        shiftType: i === 1 ? "OFFICE" : "SHIFT_NIGHT",
        branchId: sgBranch.id
      }
    }));
  }

  // Seed logs for today
  const targetDate = new Date();
  targetDate.setUTCHours(0,0,0,0); // UTC midnight of today

  console.log("Creating time logs...");

  for (const u of [...thUsers, ...sgUsers]) {
    const isThai = u.branchId === thBranch.id;
    const tzOffsetHours = isThai ? 7 : 8; // THA is UTC+7, SG is UTC+8

    let expectedLocalHour = 8;
    if (u.shiftType === "SHIFT_MORNING") expectedLocalHour = 6;
    if (u.shiftType === "SHIFT_NIGHT") expectedLocalHour = 18;

    // e.g. 18:00 Local -> 18 - 7 = 11:00 UTC
    const expectedUtcHour = expectedLocalHour - tzOffsetHours;

    // Simulate clock in exactly on time, or 10 mins late
    const isLate = Math.random() > 0.5;
    const actualUtcHour = expectedUtcHour;
    const actualUtcMin = isLate ? 10 : 0;

    const clockInTime = new Date(targetDate);
    clockInTime.setUTCHours(actualUtcHour, actualUtcMin, 0, 0);
    
    // Simulate clock out 12 hours later
    const clockOutTime = new Date(clockInTime);
    clockOutTime.setUTCHours(clockOutTime.getUTCHours() + 12);

    const b = isThai ? thBranch : sgBranch;

    await prisma.timeLog.create({
      data: {
        userId: u.id,
        recordDate: targetDate,
        clockInTime,
        clockInLat: b.lat + 0.001,
        clockInLng: b.lng + 0.001,
        clockOutTime,
        clockOutLat: b.lat - 0.001,
        clockOutLng: b.lng - 0.001
      }
    });
  }

  console.log("Done!");
}
run();
