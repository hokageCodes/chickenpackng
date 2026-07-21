"use client";

import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type SpeciesSpend = {
  category: string;
  label: string;
  spentNGN: number;
  usedValueNGN: number;
  stockValueNGN: number;
  bagsBought: number;
  bagsUsed: number;
  bagsInStock: number;
};

export type PnLRow = {
  key: string;
  label: string;
  type: string;
  status: string;
  feedCostNGN: number;
  otherCostNGN: number;
  totalCostNGN: number;
  revenueNGN: number;
  profitNGN: number;
};

const naira = (n: number) =>
  "₦" + Math.round(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });

/** Compact naira for axis ticks and in-bar labels — ₦1.2m, ₦450k. */
const nairaShort = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1_000_000) return `₦${(n / 1_000_000).toFixed(a >= 10_000_000 ? 0 : 1)}m`;
  if (a >= 1_000) return `₦${(n / 1_000).toFixed(a >= 10_000 ? 0 : 1)}k`;
  return `₦${Math.round(n)}`;
};

/** `LabelList` hands the formatter a loose `RenderableText`, not a number. */
const nairaLabel = (v: unknown) => nairaShort(Number(v ?? 0));

const fmtBags = (n: number) => (Number.isInteger(n) ? n.toString() : n.toFixed(1));

// Species keep a fixed colour across every chart on the page — identity, not
// rank, so filtering or reordering never repaints them.
const SPECIES_COLOR: Record<string, string> = {
  BROILER: "var(--series-1)",
  LAYER: "var(--series-2)",
  FISH: "var(--series-3)",
};

/* ─────────────────── Feed spend by species ─────────────────── */

function FeedTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d: SpeciesSpend = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold">{d.label} feed</p>
      <p className="mt-1 text-sm font-bold">{naira(d.spentNGN)} bought</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {fmtBags(d.bagsUsed)} of {fmtBags(d.bagsBought)} bags used ({naira(d.usedValueNGN)})
      </p>
      <p className="text-xs text-muted-foreground">
        {fmtBags(d.bagsInStock)} bags in store ({naira(d.stockValueNGN)})
      </p>
    </div>
  );
}

export function FeedSpendChart({ rows }: { rows: SpeciesSpend[] }) {
  const total = rows.reduce((s, r) => s + r.spentNGN, 0);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        No feed purchases recorded yet.
      </div>
    );
  }

  return (
    <>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 18, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="var(--viz-grid)" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "var(--viz-axis)" }}
              tick={{ fill: "var(--viz-muted)", fontSize: 12 }}
            />
            <YAxis
              tickFormatter={nairaShort}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-muted)", fontSize: 11 }}
              width={56}
            />
            <Tooltip cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.4 }} content={<FeedTooltip />} />
            <Bar dataKey="spentNGN" radius={[4, 4, 0, 0]} maxBarSize={72}>
              {rows.map((r) => (
                <Cell key={r.category} fill={SPECIES_COLOR[r.category]} />
              ))}
              <LabelList
                dataKey="spentNGN"
                position="top"
                formatter={nairaLabel}
                style={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-3 font-semibold">Feed</th>
              <th className="py-2 pr-3 text-right font-semibold">Bought</th>
              <th className="py-2 pr-3 text-right font-semibold">Spent</th>
              <th className="py-2 pr-3 text-right font-semibold">Consumed</th>
              <th className="py-2 text-right font-semibold">In store</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.map((r) => (
              <tr key={r.category} className="border-b border-border/60 last:border-0">
                <td className="py-2 pr-3">
                  <span className="flex items-center gap-2 font-semibold">
                    <span
                      aria-hidden
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{ background: SPECIES_COLOR[r.category] }}
                    />
                    {r.label}
                  </span>
                </td>
                <td className="py-2 pr-3 text-right text-muted-foreground">
                  {fmtBags(r.bagsBought)} bags
                </td>
                <td className="py-2 pr-3 text-right font-semibold">{naira(r.spentNGN)}</td>
                <td className="py-2 pr-3 text-right text-muted-foreground">
                  {naira(r.usedValueNGN)}
                </td>
                <td className="py-2 text-right text-muted-foreground">{naira(r.stockValueNGN)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="text-sm font-bold">
              <td className="pt-2">Total</td>
              <td />
              <td className="pt-2 text-right tabular-nums">{naira(total)}</td>
              <td />
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-[11px] text-muted-foreground">
        “Spent” is money actually paid for feed. “Consumed” and “In store” value bags at the
        average cost per bag, so they won’t always add up to spend — feed entered through a stock
        adjustment rather than a purchase has no cost of its own.
      </p>
    </>
  );
}

/* ─────────────────── Profit per batch ─────────────────── */

function PnLTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d: PnLRow = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold">{d.label}</p>
      <p
        className={
          "mt-1 text-sm font-bold " + (d.profitNGN < 0 ? "text-red-600" : "text-green-700")
        }
      >
        {naira(d.profitNGN)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Revenue {naira(d.revenueNGN)}</p>
      <p className="text-xs text-muted-foreground">
        Feed {naira(d.feedCostNGN)} · Other {naira(d.otherCostNGN)}
      </p>
    </div>
  );
}

export function BatchProfitChart({ rows }: { rows: PnLRow[] }) {
  const active = rows.filter((r) => r.revenueNGN !== 0 || r.totalCostNGN !== 0);

  if (active.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        No costs or revenue tagged to a batch yet. Tag entries in Finance and Feed to see
        per-batch profit here.
      </div>
    );
  }

  return (
    <>
      <div className="w-full" style={{ height: Math.max(140, active.length * 44 + 40) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={active}
            layout="vertical"
            margin={{ top: 4, right: 56, bottom: 0, left: 4 }}
          >
            <CartesianGrid stroke="var(--viz-grid)" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={nairaShort}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-muted)", fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-muted)", fontSize: 12 }}
              width={92}
            />
            <Tooltip cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.4 }} content={<PnLTooltip />} />
            <ReferenceLine x={0} stroke="var(--viz-axis)" />
            <Bar dataKey="profitNGN" radius={4} maxBarSize={26}>
              {active.map((r) => (
                <Cell
                  key={r.key}
                  fill={r.profitNGN < 0 ? "var(--viz-negative)" : "var(--viz-positive)"}
                />
              ))}
              <LabelList
                dataKey="profitNGN"
                position="right"
                formatter={nairaLabel}
                style={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[38rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-3 font-semibold">Batch</th>
              <th className="py-2 pr-3 text-right font-semibold">Revenue</th>
              <th className="py-2 pr-3 text-right font-semibold">Feed</th>
              <th className="py-2 pr-3 text-right font-semibold">Other</th>
              <th className="py-2 text-right font-semibold">Profit</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {active.map((r) => (
              <tr key={r.key} className="border-b border-border/60 last:border-0">
                <td className="py-2 pr-3">
                  <span className="font-semibold">{r.label}</span>
                  <span className="ml-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {r.type}
                  </span>
                </td>
                <td className="py-2 pr-3 text-right">{naira(r.revenueNGN)}</td>
                <td className="py-2 pr-3 text-right text-muted-foreground">
                  {naira(r.feedCostNGN)}
                </td>
                <td className="py-2 pr-3 text-right text-muted-foreground">
                  {naira(r.otherCostNGN)}
                </td>
                <td
                  className={
                    "py-2 text-right font-bold " +
                    (r.profitNGN < 0 ? "text-red-600" : r.profitNGN > 0 ? "text-green-700" : "")
                  }
                >
                  {naira(r.profitNGN)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
