"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Egg } from "lucide-react";
import { EGGS_PER_CRATE, fmtCrates } from "@/lib/farm/produce";
import type { EggPoint } from "@/lib/farm/eggs";

type Mode = "daily" | "monthly";

export type EggChartData = {
  daily: EggPoint[];
  monthly: EggPoint[];
  missingDays: string[];
  avgPerLoggedDay: number;
  bestDay: EggPoint | null;
};

const nf = (n: number) => n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

const dayChipLabel = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", { weekday: "short", day: "2-digit", month: "short" }).format(
    new Date(iso + "T12:00:00Z")
  );

function ChartTooltip({ active, payload, mode }: any) {
  if (!active || !payload?.length) return null;
  const p: EggPoint = payload[0].payload;

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-foreground">{p.label}</p>
      {p.logged ? (
        <>
          <p className="mt-1 text-sm font-bold text-foreground">{nf(p.collected)} eggs</p>
          <p className="text-xs text-muted-foreground">{fmtCrates(p.collected)}</p>
          {p.broken > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">{nf(p.broken)} broken</p>
          )}
        </>
      ) : (
        <p className="mt-1 text-xs font-semibold text-amber-600">
          {mode === "daily" ? "Not logged yet" : "No entries this month"}
        </p>
      )}
    </div>
  );
}

export default function EggProductionChart({
  data,
  onLogDate,
}: {
  data: EggChartData;
  onLogDate?: (iso: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("daily");
  const points = mode === "daily" ? data.daily : data.monthly;

  const { total, totalCrates, hasAny, plot } = useMemo(() => {
    const total = points.reduce((s, p) => s + p.collected, 0);
    const peak = points.reduce((m, p) => Math.max(m, p.collected), 0);

    // A day nobody recorded and a day the birds laid nothing both plot as zero
    // height, so absence needs its own mark — otherwise a forgotten entry reads
    // as a bad laying day, the exact confusion this chart exists to prevent.
    //
    // The ghost rides in the same stack as the real bar rather than as a Bar
    // `background`: recharts drops zero-height rectangles *and their
    // backgrounds*, which would erase the mark on precisely the days that need
    // it. Only ever one of the two is non-zero, so they never actually stack.
    const gapHeight = peak > 0 ? peak : 1;

    return {
      total,
      totalCrates: total / EGGS_PER_CRATE,
      hasAny: points.some((p) => p.logged),
      plot: points.map((p) => ({ ...p, gap: p.logged ? 0 : gapHeight })),
    };
  }, [points]);

  // Only nag about gaps the owner can still act on — a wall of 200 chips helps
  // nobody. Older gaps stay visible as ghost columns in the chart.
  const recentGaps = data.missingDays.slice(0, 8);

  return (
    <section className="viz-root space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            <Egg size={16} className="text-muted-foreground" />
            Egg production
          </h2>
          <p className="mt-1 text-2xl font-extrabold leading-none tracking-tight">
            {nf(total)}{" "}
            <span className="text-sm font-semibold text-muted-foreground">
              eggs · {totalCrates.toFixed(1)} crates
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === "daily" ? "Last 30 days" : "Last 12 months"}
            {mode === "daily" && data.avgPerLoggedDay > 0
              ? ` · ${nf(Math.round(data.avgPerLoggedDay))} avg per logged day`
              : ""}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Production period"
          className="flex shrink-0 rounded-lg border border-border p-0.5"
        >
          {(["daily", "monthly"] as Mode[]).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={
                "rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors " +
                (mode === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {m}
            </button>
          ))}
        </div>
      </header>

      {!hasAny ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No egg collections logged yet. Log one on a layer flock below and the trend appears here.
        </div>
      ) : (
        <>
          <div className="h-56 w-full sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plot} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="var(--viz-grid)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: "var(--viz-axis)" }}
                  tick={{ fill: "var(--viz-muted)", fontSize: 11 }}
                  interval="preserveStartEnd"
                  minTickGap={16}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--viz-muted)", fontSize: 11 }}
                  width={44}
                />
                <Tooltip
                  cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.4 }}
                  content={<ChartTooltip mode={mode} />}
                />
                <Bar
                  dataKey="collected"
                  stackId="eggs"
                  fill="var(--series-1)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={38}
                />
                <Bar
                  dataKey="gap"
                  stackId="eggs"
                  fill="var(--viz-gap)"
                  fillOpacity={0.55}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={38}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span
              aria-hidden
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: "var(--viz-gap)" }}
            />
            Shaded column = no entry recorded for that {mode === "daily" ? "day" : "month"}
          </p>
        </>
      )}

      {recentGaps.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <AlertTriangle size={14} />
            {data.missingDays.length} day{data.missingDays.length === 1 ? "" : "s"} with no egg
            entry
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {recentGaps.map((iso) => (
              <button
                key={iso}
                type="button"
                onClick={() => onLogDate?.(iso)}
                className="rounded-md border border-amber-300 bg-card px-2 py-1 text-[11px] font-semibold text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900/40"
              >
                {dayChipLabel(iso)}
              </button>
            ))}
            {data.missingDays.length > recentGaps.length && (
              <span className="px-1 py-1 text-[11px] text-amber-800 dark:text-amber-300">
                +{data.missingDays.length - recentGaps.length} older
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-amber-800/80 dark:text-amber-300/80">
            Pick a date to backfill it.
          </p>
        </div>
      )}
    </section>
  );
}
