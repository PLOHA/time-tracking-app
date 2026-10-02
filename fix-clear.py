import os

with open('src/actions/time-tracking.ts', 'r', encoding='utf-8') as f:
    c = f.read()

old_logic = '''  // Clear all time logs for this user for easier testing
  await prisma.timeLog.deleteMany({
    where: { userId: user.id }
  });'''

new_logic = '''  // Clear ONLY today's time log for this user
  const timezone = "Asia/Singapore";
  const today = getLocalTodayMidnightUTC(timezone);

  await prisma.timeLog.deleteMany({
    where: { 
      userId: user.id,
      recordDate: today
    }
  });'''

c = c.replace(old_logic, new_logic)

with open('src/actions/time-tracking.ts', 'w', encoding='utf-8') as f:
    f.write(c)
