export function calculateLateness(clockInTime: Date | string | null, shiftType: string) {
  if (!clockInTime) return { isLate: false, minutesLate: 0, text: "-" };

  const time = new Date(clockInTime);
  let expectedHour = 8;
  
  if (shiftType === "OFFICE") expectedHour = 8; // 08:00
  else if (shiftType === "SHIFT_MORNING") expectedHour = 6; // 06:00
  else if (shiftType === "SHIFT_NIGHT") expectedHour = 18; // 18:00

  // Expected Date object (on the same day)
  const expectedTime = new Date(time);
  expectedTime.setHours(expectedHour, 0, 0, 0);

  // If clock in time is greater than expected time
  if (time.getTime() > expectedTime.getTime()) {
    const diffMs = time.getTime() - expectedTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return { isLate: true, minutesLate: diffMins, text: `สาย ${diffMins} นาที` };
  } else {
    const diffMs = expectedTime.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return { isLate: false, minutesLate: diffMins, text: `เข้าก่อน ${diffMins} นาที` };
  }
}

export function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d);
}
