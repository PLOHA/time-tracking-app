import os, re

with open('src/actions/time-tracking.ts', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace the Office shift check
office_check_old = r'''    if \(user.shiftType === "OFFICE"\) \{
      // Office: Mon-Fri
      const dayOfWeek = bkkTime.getDay\(\); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      if \(dayOfWeek === 0 \|\| dayOfWeek === 6\) \{
        return \{ success: false, message: "Weekend! No clock-in needed \(Mon-Fri only\)." \};
      \}
      // Office check-in window \(allow 06:00 to 17:00\)
      if \(currentHour < 6 \|\| currentHour >= 17\) \{
        return \{ success: false, message: "Clock-in allowed only between 08:00 and 17:00." \};
      \}'''

office_check_new = '''    if (user.shiftType === "OFFICE") {
      const dayOfWeek = bkkTime.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return { 
          success: false, 
          errorType: "OUT_OF_HOURS", 
          serverTime: bkkTime.toISOString(),
          shiftDetails: "Mon-Fri | 08:00 - 17:00",
          message: "Weekend! No clock-in needed (Mon-Fri only)." 
        };
      }
      if (currentHour < 6 || currentHour >= 17) {
        return { 
          success: false, 
          errorType: "OUT_OF_HOURS",
          serverTime: bkkTime.toISOString(),
          shiftDetails: "Mon-Fri | 08:00 - 17:00",
          message: "Clock-in allowed only between 08:00 and 17:00." 
        };
      }'''

c = re.sub(office_check_old, office_check_new, c)

# Morning shift check
morning_old = r'''      if \(user.shiftType === "SHIFT_MORNING"\) \{
        // Morning shift: 06:00 - 18:00
        if \(currentHour < 4 \|\| currentHour >= 18\) \{
          return \{ success: false, message: "Morning shift clock-in allowed between 06:00 and 18:00." \};
        \}'''

morning_new = '''      if (user.shiftType === "SHIFT_MORNING") {
        if (currentHour < 4 || currentHour >= 18) {
          return { 
            success: false, 
            errorType: "OUT_OF_HOURS",
            serverTime: bkkTime.toISOString(),
            shiftDetails: "Morning Shift | 06:00 - 18:00",
            message: "Morning shift clock-in allowed between 06:00 and 18:00." 
          };
        }'''

c = re.sub(morning_old, morning_new, c)

# Night shift check
night_old = r'''      \} else if \(user.shiftType === "SHIFT_NIGHT"\) \{
        // Night shift: 18:00 - 06:00
        // Allow clock in from 16:00 to 06:00 the next day
        if \(currentHour >= 6 && currentHour < 16\) \{
          return \{ success: false, message: "Night shift clock-in allowed between 18:00 and 06:00." \};
        \}'''

night_new = '''      } else if (user.shiftType === "SHIFT_NIGHT") {
        if (currentHour >= 6 && currentHour < 16) {
          return { 
            success: false, 
            errorType: "OUT_OF_HOURS",
            serverTime: bkkTime.toISOString(),
            shiftDetails: "Night Shift | 18:00 - 06:00",
            message: "Night shift clock-in allowed between 18:00 and 06:00." 
          };
        }'''

c = re.sub(night_old, night_new, c)

with open('src/actions/time-tracking.ts', 'w', encoding='utf-8') as f:
    f.write(c)
