import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create an admin user if not exists
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {
      role: 'ADMIN',
    },
    create: {
      email: 'admin@company.com',
      name: 'ผู้จัดการ (HR)',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      shiftType: 'OFFICE'
    }
  });

  // Make sure test@example.com is an EMPLOYEE
  await prisma.user.updateMany({
    where: { email: 'test@example.com' },
    data: { role: 'EMPLOYEE' }
  });
  
  console.log("Roles updated!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
