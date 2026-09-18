const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const;

export function periodKeyFromDate(date = new Date()): string {
  return `${MONTHS[date.getMonth()]}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatPeriodLabel(periodKey: string): string {
  const [month, day] = periodKey.split("-");
  const label = month ? month.slice(0, 1).toUpperCase() + month.slice(1) : periodKey;
  return `${label} ${Number.parseInt(day ?? "0", 10)}`.trim();
}

export function buildMemo(periodKey: string, handle: string): string {
  return `payrun:${periodKey}:@${handle}`;
}
