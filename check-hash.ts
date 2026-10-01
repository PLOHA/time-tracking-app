import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:");
  for (const u of users) {
    console.log(`- ${u.email} : hash len ${u.passwordHash.length}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
