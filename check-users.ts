import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:");
  for (const u of users) {
    console.log(`- ${u.email} (Role: ${u.role})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
