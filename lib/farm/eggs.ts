// Egg production series for the Poultry chart.
//
// The point of the "logged" flag: the owner wants to spot days he *forgot* to
// record, so a zero-because-nothing-was-entered day must look different from a
// genuine zero-collection day. We only start looking from the first egg log
// ever recorded — before that the flock simply wasn't laying, and flagging
// those days as "missing" would be noise.

import { prisma } from "@/lib/db";
import { EGGS_PER_CRATE } from "./produce";

export type EggPoint = {
  key: string; // "2026-07-21" | "2026-07"
  label: string; // "21 Jul" | "Jul 26"
  collected: number;
  broken: number;
  crates: number;
  logged: boolean;
};

export type EggSeries = {
  daily: EggPoint[];
  monthly: EggPoint[];
  missingDays: string[]; // ISO days with no entry, most recent first
  totalCollected: number;
  totalBroken: number;
  bestDay: EggPoint | null;
  avgPerLoggedDay: number;
  firstLogDay: string | null;
};

const ymd = (d: Date) => d.toISOString().slice(0, 10);

const dayLabel = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", { day: "2-digit", month: "short" }).format(
    new Date(iso + "T12:00:00Z")
  );

const monthLabel = (key: string) =>
  new Intl.DateTimeFormat("en-NG", { month: "short", year: "2-digit" }).format(
    new Date(key + "-01T12:00:00Z")
  );

function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setUTCDate(c.getUTCDate() + n);
  return c;
}

export async function eggSeries(groupId?: string, dailyWindow = 30): Promise<EggSeries> {
  const where = groupId ? { groupId } : {};

  const [rows, first] = await Promise.all([
    prisma.eggLog.groupBy({
      by: ["date"],
      where,
      _sum: { collected: true, broken: true },
      orderBy: { date: "asc" },
    }),
    prisma.eggLog.findFirst({ where, orderBy: { date: "asc" }, select: { date: true } }),
  ]);

  // Collapse to one bucket per calendar day (entries may exist per flock).
  const byDay = new Map<string, { collected: number; broken: number }>();
  for (const r of rows) {
    const key = ymd(r.date);
    const acc = byDay.get(key) ?? { collected: 0, broken: 0 };
    acc.collected += Number(r._sum.collected ?? 0);
    acc.broken += Number(r._sum.broken ?? 0);
    byDay.set(key, acc);
  }

  const today = new Date(ymd(new Date()) + "T00:00:00Z");
  const firstLogDay = first ? ymd(first.date) : null;

  // ── Daily window ────────────────────────────────────────────
  const daily: EggPoint[] = [];
  const start = addDays(today, -(dailyWindow - 1));
  for (let d = new Date(start); d <= today; d = addDays(d, 1)) {
    const key = ymd(d);
    const hit = byDay.get(key);
    daily.push({
      key,
      label: dayLabel(key),
      collected: hit?.collected ?? 0,
      broken: hit?.broken ?? 0,
      crates: (hit?.collected ?? 0) / EGGS_PER_CRATE,
      logged: !!hit,
    });
  }

  // ── Missing days: gaps between the first log and today ──────
  const missingDays: string[] = [];
  if (firstLogDay) {
    const from = new Date(firstLogDay + "T00:00:00Z");
    for (let d = new Date(from); d <= today; d = addDays(d, 1)) {
      const key = ymd(d);
      if (!byDay.has(key)) missingDays.push(key);
    }
    missingDays.reverse();
  }

  // ── Monthly (last 12 months) ────────────────────────────────
  const byMonth = new Map<string, { collected: number; broken: number }>();
  for (const [key, v] of byDay) {
    const m = key.slice(0, 7);
    const acc = byMonth.get(m) ?? { collected: 0, broken: 0 };
    acc.collected += v.collected;
    acc.broken += v.broken;
    byMonth.set(m, acc);
  }

  const monthly: EggPoint[] = [];
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 11, 1));
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + i, 1));
    const key = ymd(d).slice(0, 7);
    const hit = byMonth.get(key);
    monthly.push({
      key,
      label: monthLabel(key),
      collected: hit?.collected ?? 0,
      broken: hit?.broken ?? 0,
      crates: (hit?.collected ?? 0) / EGGS_PER_CRATE,
      logged: !!hit,
    });
  }

  // ── Summary ─────────────────────────────────────────────────
  let totalCollected = 0;
  let totalBroken = 0;
  for (const v of byDay.values()) {
    totalCollected += v.collected;
    totalBroken += v.broken;
  }

  const loggedDaily = daily.filter((p) => p.logged);
  const bestDay = loggedDaily.reduce<EggPoint | null>(
    (best, p) => (!best || p.collected > best.collected ? p : best),
    null
  );
  const avgPerLoggedDay = loggedDaily.length
    ? loggedDaily.reduce((s, p) => s + p.collected, 0) / loggedDaily.length
    : 0;

  return {
    daily,
    monthly,
    missingDays,
    totalCollected,
    totalBroken,
    bestDay,
    avgPerLoggedDay,
    firstLogDay,
  };
}
