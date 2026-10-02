import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const branches = await prisma.branch.findMany({ orderBy: { createdAt: 'asc' } });
  
  if (branches.length >= 2) {
    await prisma.branch.update({
      where: { id: branches[0].id },
      data: {
        name: "Seagate Korat TH",
        timezone: "Asia/Bangkok",
        lat: 14.884154631147393,
        lng: 101.85172249999998,
        allowedRadius: 500,
      }
    });

    await prisma.branch.update({
      where: { id: branches[1].id },
      data: {
        name: "Seagate Woodlands SG",
        timezone: "Asia/Singapore",
        lat: 1.447394053217028,
        lng: 103.807376328149,
        allowedRadius: 500,
      }
    });
    
    await prisma.user.updateMany({
      where: { email: "test@example.com" },
      data: { branchId: branches[1].id }
    });
    console.log("Updated existing branches!");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
