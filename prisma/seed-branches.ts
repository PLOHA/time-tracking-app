import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hq = await prisma.branch.create({
    data: {
      name: "Bangkok HQ",
      timezone: "Asia/Bangkok",
      lat: 13.7563,
      lng: 100.5018,
      allowedRadius: 500,
    }
  });

  const sg = await prisma.branch.create({
    data: {
      name: "Singapore Office",
      timezone: "Asia/Singapore",
      lat: 1.3521,
      lng: 103.8198,
      allowedRadius: 500,
    }
  });

  console.log("Branches seeded:", hq.name, sg.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
