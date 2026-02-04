export function buildDateFromDateAndTime(dateStr: string, timeStr: string) {
  const [m, d, y] = dateStr.split("/").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  return new Date(y, m - 1, d, h, min);
}

export const MAX_DAYS_AHEAD = 30;

export function getMaxAllowedDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + MAX_DAYS_AHEAD);
  return maxDate;
}

export function formatTimeForInputFromDate(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
