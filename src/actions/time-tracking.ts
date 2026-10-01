"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getCompanySettings() {
  const settings = await prisma.companySetting.findFirst();
  return settings;
}

export async function clockIn(lat: number, lng: number, distance: number, allowedRadius: number) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) throw new Error("User not found");

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // --- Shift Validation Logic ---
  const currentHour = now.getHours();

  if (user.shiftType === "OFFICE") {
    // Office: Mon-Fri
    const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { success: false, message: "ไม่อนุญาตให้ลงเวลา วันนี้เป็นวันหยุดของคุณ (ส.-อา.)" };
    }
    // Office check-in window (allow 06:00 to 17:00)
    if (currentHour < 6 || currentHour >= 17) {
      return { success: false, message: "อยู่นอกช่วงเวลาอนุญาตให้เข้างานสำหรับพนักงานออฟฟิศ (08.00-17.00)" };
    }
  } else {
    // Shift workers (4 work, 2 off)
    if (!user.cycleStartDate) {
      return { success: false, message: "ยังไม่ได้ตั้งค่าวันเริ่มรอบกะการทำงาน (Cycle Start Date) กรุณาติดต่อ HR" };
    }

    const start = new Date(user.cycleStartDate);
    start.setHours(0,0,0,0);
    
    // Calculate difference in days
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // 6-day cycle (4 work, 2 off)
    const cycleDay = diffDays % 6; 
    
    if (cycleDay >= 4) {
      // 4 and 5 are off days
      return { success: false, message: "ไม่อนุญาตให้ลงเวลา วันนี้เป็นรอบวันหยุดของคุณ (2 วันหยุด)" };
    }

    if (user.shiftType === "SHIFT_MORNING") {
      // Morning shift: 06:00 - 18:00
      if (currentHour < 4 || currentHour >= 18) {
        return { success: false, message: "อยู่นอกช่วงเวลาอนุญาตให้เข้างานสำหรับกะเช้า (06.00-18.00)" };
      }
    } else if (user.shiftType === "SHIFT_NIGHT") {
      // Night shift: 18:00 - 06:00
      // Allow clock in from 16:00 to 06:00 the next day
      if (currentHour >= 6 && currentHour < 16) {
        return { success: false, message: "อยู่นอกช่วงเวลาอนุญาตให้เข้างานสำหรับกะดึก (18.00-06.00)" };
      }
    }
  }

  // --- End Shift Validation ---

  // Check if already clocked in today
  // Note: For night shift, "today" might be tricky if they clock in past midnight, 
  // but for simplicity we'll group by actual date for now.
  const existingLog = await prisma.timeLog.findFirst({
    where: {
      userId: user.id,
      recordDate: today,
    },
  });

  if (existingLog && !existingLog.clockOutTime) {
    return { success: false, message: "คุณได้ลงเวลาเข้างานไปแล้ว และยังไม่ได้ลงเวลาออก" };
  }

  const isFlagged = distance > allowedRadius;

  // Add realistic GPS jitter (approx +/- 5 meters = 0.000045 degrees)
  const jitteredLat = lat + (Math.random() - 0.5) * 0.00009;
  const jitteredLng = lng + (Math.random() - 0.5) * 0.00009;

  await prisma.timeLog.create({
    data: {
      userId: user.id,
      recordDate: today,
      clockInTime: new Date(),
      clockInLat: jitteredLat,
      clockInLng: jitteredLng,
      clockInFlagged: isFlagged,
    },
  });

  return { success: true, message: "ลงเวลาเข้างานสำเร็จ", flagged: isFlagged };
}

export async function getTodayLog() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const log = await prisma.timeLog.findFirst({
    where: {
      userId: user.id,
      recordDate: today,
    },
    include: {
      user: true
    }
  });

  return log;
}

export async function clockOut(lat: number, lng: number, distance: number, allowedRadius: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) throw new Error("User not found");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingLog = await prisma.timeLog.findFirst({
    where: {
      userId: user.id,
      recordDate: today,
    },
  });

  if (!existingLog) {
    return { success: false, message: "ไม่พบข้อมูลการลงเวลาเข้างานในวันนี้" };
  }

  if (existingLog.clockOutTime) {
    return { success: false, message: "คุณได้ลงเวลาออกงานไปแล้ว" };
  }

  const isFlagged = distance > allowedRadius;

  // Add realistic GPS jitter (approx +/- 5 meters = 0.000045 degrees)
  const jitteredLat = lat + (Math.random() - 0.5) * 0.00009;
  const jitteredLng = lng + (Math.random() - 0.5) * 0.00009;

  await prisma.timeLog.update({
    where: { id: existingLog.id },
    data: {
      clockOutTime: new Date(),
      clockOutLat: jitteredLat,
      clockOutLng: jitteredLng,
      clockOutFlagged: isFlagged,
    },
  });

  return { success: true, message: "ลงเวลาออกงานสำเร็จ", flagged: isFlagged };
}

export async function clearMyLogs() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  
  if (!user) return;

  // Clear all time logs for this user for easier testing
  await prisma.timeLog.deleteMany({
    where: { userId: user.id }
  });
  
  return { success: true };
}

export async function getMyHistory(year: number, month: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return [];

  // Create date range for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month

  const logs = await prisma.timeLog.findMany({
    where: {
      userId: user.id,
      recordDate: {
        gte: startDate,
        lte: endDate,
      }
    },
    include: {
      user: {
        select: {
          shiftType: true
        }
      }
    },
    orderBy: {
      recordDate: 'asc'
    }
  });

  return logs;
}
