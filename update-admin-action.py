import os, re

with open('src/actions/admin.ts', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace getAdminLogs function signature and where clause
old_get_logs = r'''export async function getAdminLogs\(dateStr\?: string\) \{[\s\S]*?const logs = await prisma\.timeLog\.findMany\(\{
    where: \{
      recordDate: targetDate,
    \},'''

new_get_logs = '''export async function getAdminLogs(dateStr?: string, timeRange: "DAY" | "MONTH" | "YEAR" = "DAY") {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("Forbidden"); 
  }

  let targetDate = getLocalTodayMidnightUTC();
  if (dateStr) {
    targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
  }

  let whereClause: any = {};
  if (timeRange === "DAY") {
    whereClause.recordDate = targetDate;
  } else if (timeRange === "MONTH") {
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
    whereClause.recordDate = { gte: startOfMonth, lte: endOfMonth };
  } else if (timeRange === "YEAR") {
    const startOfYear = new Date(targetDate.getFullYear(), 0, 1);
    const endOfYear = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59, 999);
    whereClause.recordDate = { gte: startOfYear, lte: endOfYear };
  }

  const logs = await prisma.timeLog.findMany({
    where: whereClause,'''

c = re.sub(old_get_logs, new_get_logs, c)

with open('src/actions/admin.ts', 'w', encoding='utf-8') as f:
    f.write(c)
