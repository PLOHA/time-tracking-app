const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { shiftType: 'OFFICE', cycleStartDate: null },
    data: { cycleStartDate: new Date('2026-10-02T00:00:00Z') }
  });
  console.log('Updated OFFICE users successfully.');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
