export const isoDate = (d: Date) => new Date(d).toISOString().slice(0, 10);

export const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));

export function numberOrZero(n: unknown) {
  if (typeof n === "number") return n;
  if (typeof n === "string") return Number(n) || 0;
  return 0;
}
