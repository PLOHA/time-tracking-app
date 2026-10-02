export function getBKKTime() {
  const now = new Date();
  const bkkString = now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
  return new Date(bkkString);
}

export function getBKKTodayMidnightUTC() {
  const bkk = getBKKTime();
  // Create a UTC date that represents midnight of the BKK date.
  const today = new Date();
  today.setUTCFullYear(bkk.getFullYear());
  today.setUTCMonth(bkk.getMonth());
  today.setUTCDate(bkk.getDate());
  today.setUTCHours(0, 0, 0, 0);
  return today;
}
