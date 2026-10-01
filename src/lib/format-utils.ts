export function formatDuration(minutes: number, language: "th" | "en", isLate: boolean): string {
  if (minutes === 0) {
    return language === "th" ? "ตรงเวลา" : "On time";
  }

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const parts = [];
  if (hrs > 0) {
    parts.push(language === "th" ? `${hrs} ชม.` : `${hrs} hr`);
  }
  if (mins > 0 || hrs === 0) {
    parts.push(language === "th" ? `${mins} นาที` : `${mins} min`);
  }

  const durationStr = parts.join(" ");

  if (language === "th") {
    return isLate ? `สาย ${durationStr}` : `เข้าก่อน ${durationStr}`;
  } else {
    return isLate ? `Late ${durationStr}` : `Early ${durationStr}`;
  }
}

export function formatDistance(meters: number | null | undefined, language: "th" | "en"): string {
  if (meters === null || meters === undefined) return "-";
  
  if (meters < 1000) {
    return language === "th" ? `${meters} ม.` : `${meters} m`;
  }
  
  const km = Math.floor(meters / 1000);
  const m = meters % 1000;
  
  if (m === 0) {
    return language === "th" ? `${km} กม.` : `${km} km`;
  }
  
  return language === "th" ? `${km} กม. ${m} ม.` : `${km} km ${m} m`;
}
