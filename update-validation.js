const fs = require('fs');

let c = fs.readFileSync('src/actions/time-tracking.ts', 'utf-8');

const oldLogic = `  // --- Shift Validation Logic ---
  const currentHour = bkkTime.getHours();

  if (user.shiftType === "OFFICE") {
    // Office: Mon-Fri
    const dayOfWeek = bkkTime.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { success: false, message: "Weekend! No clock-in needed (Mon-Fri only)." };
    }
    // Office check-in window (allow 06:00 to 17:00)
    if (currentHour < 6 || currentHour >= 17) {
      return { success: false, message: "Clock-in allowed only between 08:00 and 17:00." };
    }
  } else {
    // Shift workers (4 work, 2 off)
    if (!user.cycleStartDate) {
      return { success: false, message: "Missing Cycle Start Date. Please contact HR." };
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
      return { success: false, message: "You are currently on your 2-day off cycle." };
    }

    if (user.shiftType === "SHIFT_MORNING") {
      // Morning shift: 06:00 - 18:00
      // Allow clock in from 04:00 to 18:00
      if (currentHour < 4 || currentHour >= 18) {
        return { success: false, message: "Morning shift clock-in allowed between 06:00 and 18:00." };
      }
    } else if (user.shiftType === "SHIFT_NIGHT") {
      // Night shift: 18:00 - 06:00
      // Allow clock in from 16:00 to 06:00 the next day
      if (currentHour >= 6 && currentHour < 16) {
        return { success: false, message: "Night shift clock-in allowed between 18:00 and 06:00." };
      }
    }
  }`;

const newLogic = `  // --- Shift Validation Logic ---
  const currentHour = bkkTime.getHours();

  const getShiftError = (shiftType: string) => {
    if (shiftType === "OFFICE") return "Since your working hours are Time: 08.00 AM - 17.00 PM || Date: Mon-Fri, you cannot perform this action at this moment. Please wait for your working hours.";
    if (shiftType === "SHIFT_MORNING") return "Since your working hours are Time: 06.00 AM - 18.00 PM || Date: 4 Work 2 Off Cycle, you cannot perform this action at this moment. Please wait for your working hours.";
    if (shiftType === "SHIFT_NIGHT") return "Since your working hours are Time: 18.00 PM - 06.00 AM || Date: 4 Work 2 Off Cycle, you cannot perform this action at this moment. Please wait for your working hours.";
    return "You cannot perform this action at this moment. Please wait for your working hours.";
  };

  if (user.shiftType === "OFFICE") {
    const dayOfWeek = bkkTime.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { success: false, message: getShiftError(user.shiftType) };
    }
    // Office check-in window (allow 06:00 to 17:00)
    if (currentHour < 6 || currentHour >= 17) {
      return { success: false, message: getShiftError(user.shiftType) };
    }
  } else {
    if (!user.cycleStartDate) {
      return { success: false, message: "Missing Cycle Start Date. Please contact HR." };
    }

    const start = new Date(user.cycleStartDate);
    start.setHours(0,0,0,0);
    
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const cycleDay = diffDays % 6; 
    
    if (cycleDay >= 4) {
      return { success: false, message: "You are currently on your 2-day off cycle. " + getShiftError(user.shiftType) };
    }

    if (user.shiftType === "SHIFT_MORNING") {
      if (currentHour < 4 || currentHour >= 18) {
        return { success: false, message: getShiftError(user.shiftType) };
      }
    } else if (user.shiftType === "SHIFT_NIGHT") {
      if (currentHour >= 6 && currentHour < 16) {
        return { success: false, message: getShiftError(user.shiftType) };
      }
    }
  }`;

c = c.replace(oldLogic, newLogic);

fs.writeFileSync('src/actions/time-tracking.ts', c);
console.log("Replaced validation logic in time-tracking.ts");
