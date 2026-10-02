const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.companySetting.upsert({
    where: { id: 1 },
    update: {
      companyLat: 1.4473917309201805,
      companyLng: 103.80738155272815
    },
    create: {
      id: 1,
      companyLat: 1.4473917309201805,
      companyLng: 103.80738155272815,
      allowedRadius: 500
    }
  });

  console.log("Updated Seagate HQ W1 coordinates.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
