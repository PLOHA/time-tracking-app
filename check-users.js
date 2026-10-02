const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany({ include: { branch: true } });
  users.forEach(u => console.log(u.name, "Branch:", u.branch?.name, "TZ:", u.branch?.timezone));
}
run();
