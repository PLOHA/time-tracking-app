"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { calculateLateness } from "@/lib/time-utils";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getLocalTodayMidnightUTC } from "@/lib/timezone";

export async function getAdminLogs(dateStr?: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) throw new Error("Unauthorized");

  // In a real app we'd check if user.role === 'ADMIN'
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("Forbidden"); 
  }

  // Target date (default to today)
  let targetDate = getLocalTodayMidnightUTC();
  if (dateStr) {
    targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
  }

  const logs = await prisma.timeLog.findMany({
    where: {
      recordDate: targetDate,
    },
    include: {
      user: {
        select: {
            id: true,
            name: true,
            email: true,
            shiftType: true,
            branch: {
              select: { timezone: true }
            }
          }
      }
    },
    orderBy: {
      clockInTime: 'desc'
    }
  });

  const settings = await prisma.companySetting.findFirst();

  // Helper function for distance
  function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371e3;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  // Helper function for lateness
  function calcLate(clockInTime: Date | null, shiftType: string) {
    if (!clockInTime) return { isLate: false, text: "-" };
    const time = new Date(clockInTime);
    let expectedHour = 8;
    if (shiftType === "OFFICE") expectedHour = 8;
    else if (shiftType === "SHIFT_MORNING") expectedHour = 6;
    else if (shiftType === "SHIFT_NIGHT") expectedHour = 18;
    
    const expectedTime = new Date(time);
    expectedTime.setHours(expectedHour, 0, 0, 0);
    
    if (time.getTime() > expectedTime.getTime()) {
      const diffMins = Math.floor((time.getTime() - expectedTime.getTime()) / 60000);
      return { isLate: diffMins > 0, minutesLate: diffMins, text: diffMins === 0 ? 'ตรงเวลา' : `สาย ${diffMins} นาที` };
    } else {
      const diffMins = Math.floor((expectedTime.getTime() - time.getTime()) / 60000);
      return { isLate: false, minutesLate: diffMins, text: diffMins === 0 ? 'ตรงเวลา' : `เข้าก่อน ${diffMins} นาที` };
    }
  }

  const enrichedLogs = logs.map(log => {
    let distanceIn = null;
    let distanceOut = null;
    if (settings && log.clockInLat && log.clockInLng) {
      distanceIn = calcDistance(log.clockInLat, log.clockInLng, settings.companyLat, settings.companyLng);
    }
    if (settings && log.clockOutLat && log.clockOutLng) {
      distanceOut = calcDistance(log.clockOutLat, log.clockOutLng, settings.companyLat, settings.companyLng);
    }
    
    const lateness = calcLate(log.clockInTime, log.user.shiftType);

    return {
      ...log,
      distanceIn,
      distanceOut,
      lateness
    };
  });

  return enrichedLogs;
}

export async function getAdminMonthlyLogs(year: number, month: number, targetUserId?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("Forbidden"); 
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const whereClause: any = {
    recordDate: {
      gte: startDate,
      lte: endDate
    }
  };

  if (targetUserId) {
    whereClause.userId = targetUserId;
  }

  const logs = await prisma.timeLog.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
            id: true,
            name: true,
            email: true,
            shiftType: true,
            branch: {
              select: { timezone: true }
            }
          }
      }
    },
    orderBy: [
      { recordDate: 'asc' },
      { clockInTime: 'asc' }
    ]
  });

  const settings = await prisma.companySetting.findFirst();

  function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371e3;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  return logs.map(log => {
    let distanceIn = null;
    let distanceOut = null;
    if (settings && log.clockInLat && log.clockInLng) {
      distanceIn = calcDistance(log.clockInLat, log.clockInLng, settings.companyLat, settings.companyLng);
    }
    if (settings && log.clockOutLat && log.clockOutLng) {
      distanceOut = calcDistance(log.clockOutLat, log.clockOutLng, settings.companyLat, settings.companyLng);
    }
    
    const tz = log.user.branch?.timezone || "Asia/Bangkok";
      const { isLate, minutesLate, text } = calculateLateness(log.clockInTime, log.user.shiftType, tz);

      return {
        ...log,
        distanceIn,
        distanceOut,
        lateness: { isLate, minutesLate, text },
        lateMinutes: minutesLate
      };
  });
}

export async function updateCompanySettings(data: { lat: number, lng: number, radius: number }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  // Ensure Admin
  if (!user || user.role !== "ADMIN") throw new Error("Forbidden");

  await prisma.companySetting.upsert({
    where: { id: 1 },
    update: {
      companyLat: data.lat,
      companyLng: data.lng,
      allowedRadius: data.radius,
    },
    create: {
      id: 1,
      companyLat: data.lat,
      companyLng: data.lng,
      allowedRadius: data.radius,
    },
  });

  return { success: true, message: "อัปเดตการตั้งค่าสำเร็จ" };
}

export async function getAdminBranches() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || (session.user as any).role !== 'ADMIN') return [];
  return await prisma.branch.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function createAdminBranch(data: { name: string, timezone: string, lat: number, lng: number, allowedRadius: number }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || (session.user as any).role !== 'ADMIN') throw new Error('Unauthorized');
  return await prisma.branch.create({ data });
}

export async function updateAdminBranch(id: string, data: { name: string, timezone: string, lat: number, lng: number, allowedRadius: number }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || (session.user as any).role !== 'ADMIN') throw new Error('Unauthorized');
  return await prisma.branch.update({ where: { id }, data });
}
