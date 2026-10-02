export function getLocalTime(timezone: string = "Asia/Bangkok") {
  const now = new Date();
  const localString = now.toLocaleString("en-US", { timeZone: timezone });
  return new Date(localString);
}

export function getLocalTodayMidnightUTC(timezone: string = "Asia/Bangkok") {
  const localTime = getLocalTime(timezone);
  // Create a UTC date that represents midnight of the local date.
  const today = new Date();
  today.setUTCFullYear(localTime.getFullYear());
  today.setUTCMonth(localTime.getMonth());
  today.setUTCDate(localTime.getDate());
  today.setUTCHours(0, 0, 0, 0);
  return today;
}
