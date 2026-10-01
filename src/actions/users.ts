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

  // Validate if email exists
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    return { success: false, message: "อีเมลนี้มีในระบบแล้ว" };
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

  return { success: true, message: "เพิ่มพนักงานสำเร็จ" };
}
