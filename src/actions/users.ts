"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getUsers() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      shiftType: true,
      cycleStartDate: true,
      role: true,
    }
  });

  return users;
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordRaw: string;
  shiftType: "OFFICE" | "SHIFT_MORNING" | "SHIFT_NIGHT";
  cycleStartDate: string | null;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    return { success: false, message: "Email already exists" };
  }

  const passwordHash = await bcrypt.hash(data.passwordRaw, 10);

  let parsedDate = null;
  if (data.cycleStartDate) {
    parsedDate = new Date(data.cycleStartDate);
  }

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: passwordHash,
      shiftType: data.shiftType,
      cycleStartDate: parsedDate,
    },
  });

  return { success: true, message: "Success" };
}

export async function updateUser(id: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || (session.user as any).role !== 'ADMIN') throw new Error('Unauthorized');
  
  if (data.branchId) delete data.branchId;

  await prisma.user.update({ where: { id }, data });
  return { success: true };
}
