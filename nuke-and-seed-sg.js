const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  await prisma.timeLog.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.companySetting.deleteMany({});

  await prisma.companySetting.create({
    data: {
      id: 1,
      companyLat: 1.4429,
      companyLng: 103.7846, // Seagate Woodlands SG coordinates
      allowedRadius: 1000,
    }
  });

  const passwordHash = await bcrypt.hash('123456', 10);
  
  await prisma.user.create({
    data: {
      email: 'admin@hr.com',
      name: 'Admin HR',
      passwordHash,
      role: 'ADMIN',
      shiftType: 'OFFICE'
    }
  });

  const u1 = await prisma.user.create({
    data: {
      email: 'sg1@seagate.com',
      name: 'Pee Rloha',
      passwordHash,
      role: 'EMPLOYEE',
      shiftType: 'OFFICE'
    }
  });

  const u2 = await prisma.user.create({
    data: {
      email: 'sg2@seagate.com',
      name: 'Wong Lee',
      passwordHash,
      role: 'EMPLOYEE',
      shiftType: 'SHIFT_MORNING',
      cycleStartDate: new Date()
    }
  });

  console.log('Seeded HR and 2 SG Employees.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
