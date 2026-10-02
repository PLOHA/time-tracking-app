export function calculateLateness(clockInTime: Date | string | null, shiftType: string, timezone: string = 'Asia/Bangkok') {
  if (!clockInTime) return { isLate: false, minutesLate: 0, text: "-" };

  const time = new Date(clockInTime);
  let expectedHour = 8;
  if (shiftType === "OFFICE") expectedHour = 8;
  else if (shiftType === "SHIFT_MORNING") expectedHour = 6;
  else if (shiftType === "SHIFT_NIGHT") expectedHour = 18;

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
  }).formatToParts(time);

  const p = (type: string) => parseInt(parts.find(x => x.type === type)?.value || '0', 10);
  let hr = p('hour');
  if (hr === 24) hr = 0;

  const localTimeMs = Date.UTC(p('year'), p('month') - 1, p('day'), hr, p('minute'), p('second'));
  const expectedTimeMs = Date.UTC(p('year'), p('month') - 1, p('day'), expectedHour, 0, 0);

  if (localTimeMs > expectedTimeMs) {
    const diffMs = localTimeMs - expectedTimeMs;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return { isLate: diffMins > 0, minutesLate: diffMins, text: diffMins === 0 ? 'ตรงเวลา' : `สาย ${diffMins} นาที` };
  } else {
    const diffMs = expectedTimeMs - localTimeMs;
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
