import os

with open('src/actions/time-tracking.ts', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'return { success: false, message: "Weekend! No clock-in needed (Mon-Fri only)." };',
    'return { success: false, errorType: "OUT_OF_HOURS", serverTime: bkkTime.toISOString(), shiftDetails: "Office (Mon-Fri | 08:00 - 17:00)", message: "Weekend! No clock-in needed (Mon-Fri only)." };'
)

c = c.replace(
    'return { success: false, message: "Clock-in allowed only between 08:00 and 17:00." };',
    'return { success: false, errorType: "OUT_OF_HOURS", serverTime: bkkTime.toISOString(), shiftDetails: "Office (Mon-Fri | 08:00 - 17:00)", message: "Clock-in allowed only between 08:00 and 17:00." };'
)

c = c.replace(
    'return { success: false, message: "You are currently on your 2-day off cycle." };',
    'return { success: false, errorType: "OUT_OF_HOURS", serverTime: bkkTime.toISOString(), shiftDetails: "Shift Worker (4 work, 2 off)", message: "You are currently on your 2-day off cycle." };'
)

c = c.replace(
    'return { success: false, message: "Morning shift clock-in allowed between 06:00 and 18:00." };',
    'return { success: false, errorType: "OUT_OF_HOURS", serverTime: bkkTime.toISOString(), shiftDetails: "Morning Shift (06:00 - 18:00)", message: "Morning shift clock-in allowed between 06:00 and 18:00." };'
)

c = c.replace(
    'return { success: false, message: "Night shift clock-in allowed between 18:00 and 06:00." };',
    'return { success: false, errorType: "OUT_OF_HOURS", serverTime: bkkTime.toISOString(), shiftDetails: "Night Shift (18:00 - 06:00)", message: "Night shift clock-in allowed between 18:00 and 06:00." };'
)

with open('src/actions/time-tracking.ts', 'w', encoding='utf-8') as f:
    f.write(c)
