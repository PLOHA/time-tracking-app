import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const morningNames = [
  "กฤษณะ มุ่งมั่น",
  "ณัฐพล ขยันดี",
  "ธนกร ทองสุข",
  "ปาริชาต แจ่มใส",
  "สุจิตรา อารีย์"
];

const nightNames = [
  "วีระยุทธ ยามดึก",
  "ศุภโชค ตาไว",
  "อรรถพล คนเก่ง",
  "จิราพร ดารา",
  "ณิชา ใจดี",
  "ทศพล กล้าหาญ",
  "พรเพ็ญ เย็นใจ"
];

// Reference company lat/lng
const COMPANY_LAT = 13.7563;
const COMPANY_LNG = 100.5018;

function getRandomLatLng(inBounds: boolean) {
  // 1 degree is approx 111km. 500m is approx 0.0045 degrees.
  const offset = inBounds ? (Math.random() * 0.003) : (0.005 + Math.random() * 0.005);
  const sign1 = Math.random() > 0.5 ? 1 : -1;
  const sign2 = Math.random() > 0.5 ? 1 : -1;
  return {
    lat: COMPANY_LAT + (offset * sign1),
    lng: COMPANY_LNG + (offset * sign2)
  };
}

async function main() {
  console.log("Seeding more employees...");

  const passwordHash = await bcrypt.hash('password123', 10);
  const users = [];

  // Create Morning Shift Users
  for (let i = 0; i < 5; i++) {
    // Stagger start dates: Aug 25, Aug 26, Aug 27, Aug 28, Aug 29
    const cycleStart = new Date(2026, 7, 25 + i); 
    const u = await prisma.user.create({
      data: {
        name: morningNames[i],
        email: `morning${i+1}@example.com`,
        passwordHash,
        role: "EMPLOYEE",
        shiftType: "SHIFT_MORNING",
        cycleStartDate: cycleStart
      }
    });
    users.push(u);
  }

  // Create Night Shift Users
  for (let i = 0; i < 7; i++) {
    // Stagger start dates: Aug 25 to Aug 31
    const cycleStart = new Date(2026, 7, 25 + i); 
    const u = await prisma.user.create({
      data: {
        name: nightNames[i],
        email: `night${i+1}@example.com`,
        passwordHash,
        role: "EMPLOYEE",
        shiftType: "SHIFT_NIGHT",
        cycleStartDate: cycleStart
      }
    });
    users.push(u);
  }

  console.log("Created 12 users. Generating September 2026 logs...");

  const logsData = [];

  // Sept 1 to Sept 30
  for (let day = 1; day <= 30; day++) {
    const currentDay = new Date(2026, 8, day);
    currentDay.setHours(0,0,0,0); // normalize

    for (const u of users) {
      if (!u.cycleStartDate) continue;

      const cycleStart = new Date(u.cycleStartDate);
      cycleStart.setHours(0,0,0,0);
      
      const diffMs = currentDay.getTime() - cycleStart.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      const cycleDay = diffDays % 6; // 0,1,2,3 are work. 4,5 are rest.

      if (cycleDay >= 0 && cycleDay <= 3) {
        // It's a work day!
        const isMorning = u.shiftType === "SHIFT_MORNING";
        
        // Expected times
        const expectedIn = new Date(currentDay);
        expectedIn.setHours(isMorning ? 6 : 18, 0, 0, 0);
        
        // Randomize clock in
        const isLate = Math.random() < 0.20; // 20% chance of being late
        let inMinutesOffset = isLate ? Math.floor(Math.random() * 45) + 5 : -Math.floor(Math.random() * 20); // late by 5-50m, or early by 0-20m
        
        const actualIn = new Date(expectedIn.getTime() + inMinutesOffset * 60000);
        
        const isOutOfBondsIn = Math.random() < 0.10; // 10% out of bounds
        const locIn = getRandomLatLng(!isOutOfBondsIn);

        // Randomize clock out
        const forgetToOut = Math.random() < 0.05; // 5% forget to clock out
        
        let actualOut = null;
        let isOutOfBondsOut = false;
        let locOut = { lat: null as number|null, lng: null as number|null };

        if (!forgetToOut) {
          const expectedOut = new Date(expectedIn);
          expectedOut.setHours(expectedOut.getHours() + 12); // 12 hour shift
          
          let outMinutesOffset = Math.floor(Math.random() * 30); // overtime 0-30m
          actualOut = new Date(expectedOut.getTime() + outMinutesOffset * 60000);
          
          isOutOfBondsOut = Math.random() < 0.10;
          locOut = getRandomLatLng(!isOutOfBondsOut);
        }

        logsData.push({
          userId: u.id,
          recordDate: currentDay,
          clockInTime: actualIn,
          clockInLat: locIn.lat,
          clockInLng: locIn.lng,
          clockInFlagged: isOutOfBondsIn,
          clockOutTime: actualOut,
          clockOutLat: locOut.lat,
          clockOutLng: locOut.lng,
          clockOutFlagged: actualOut ? isOutOfBondsOut : false,
        });
      }
    }
  }

  await prisma.timeLog.createMany({
    data: logsData
  });

  console.log(`Created ${logsData.length} mock logs for Sept 2026.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
