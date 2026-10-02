export function calculateLateness(clockInTime: Date | string | null, shiftType: string, timezone: string = 'Asia/Bangkok') {
  if (!clockInTime) return { isLate: false, minutesLate: 0, text: "-" };

  const time = new Date(clockInTime);
  let expectedHour = 8;
  if (shiftType === "OFFICE") expectedHour = 8;
  else if (shiftType === "SHIFT_MORNING") expectedHour = 6;
  else if (shiftType === "SHIFT_NIGHT") expectedHour = 18;

  const getOffsetMs = (date: Date, tz: string) => {
    const tzString = date.toLocaleString('en-US', { timeZone: tz });
    const utcString = date.toLocaleString('en-US', { timeZone: 'UTC' });
    return new Date(tzString).getTime() - new Date(utcString).getTime();
  };

  const offsetMs = getOffsetMs(time, timezone);
  const localTimeMs = time.getTime() + offsetMs;
  
  const expectedLocalDate = new Date(localTimeMs);
  expectedLocalDate.setUTCHours(expectedHour, 0, 0, 0);

  if (localTimeMs > expectedLocalDate.getTime()) {
    const diffMs = localTimeMs - expectedLocalDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return { isLate: diffMins > 0, minutesLate: diffMins, text: diffMins === 0 ? 'ตรงเวลา' : `สาย ${diffMins} นาที` };
  } else {
    const diffMs = expectedLocalDate.getTime() - localTimeMs;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return { isLate: false, minutesLate: diffMins, text: diffMins === 0 ? 'ตรงเวลา' : `ก่อนเวลา ${diffMins} นาที` };
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
