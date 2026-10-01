import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  
  await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test Employee",
      passwordHash: passwordHash,
      shiftType: "OFFICE",
    },
  });

  // seed company settings
  await prisma.companySetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyLat: 13.7563, // Bangkok default
      companyLng: 100.5018,
      allowedRadius: 500
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
