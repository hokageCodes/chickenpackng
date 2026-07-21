import Link from "next/link";
import { TrendingUp, TrendingDown, Scale, Info, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { batchPnL, feedSpendBySpecies } from "@/lib/farm/costing";
import {
  BatchProfitChart,
  FeedSpendChart,
  type PnLRow,
  type SpeciesSpend,
} from "./AnalyticsCharts";

export const dynamic = "force-dynamic";

const naira = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");

const SPECIES_LABEL: Record<string, string> = {
  BROILER: "Broilers",
  LAYER: "Layers",
  FISH: "Fish",
};

async function getData() {
  const [feed, pnl, expAgg, revAgg] = await Promise.all([
    feedSpendBySpecies(),
    batchPnL(),
    prisma.expense.aggregate({ _sum: { amountNGN: true } }),
    prisma.revenue.aggregate({ _sum: { amountNGN: true } }),
  ]);

  const feedRows: SpeciesSpend[] = feed.map((f) => ({
    category: f.category,
    label: SPECIES_LABEL[f.category] ?? f.category,
    spentNGN: f.spentNGN,
    usedValueNGN: f.usedValueNGN,
    stockValueNGN: f.stockValueNGN,
    bagsBought: f.bagsBought,
    bagsUsed: f.bagsUsed,
    bagsInStock: f.bagsInStock,
  }));

  const pnlRows: PnLRow[] = pnl.rows.map((r) => ({
    key: r.key,
    label: r.label,
    type: r.type,
    status: r.status,
    feedCostNGN: r.feedCostNGN,
    otherCostNGN: r.otherCostNGN,
    totalCostNGN: r.totalCostNGN,
    revenueNGN: r.revenueNGN,
    profitNGN: r.profitNGN,
  }));

  const revenue = Number(revAgg._sum.amountNGN ?? 0);
  const expense = Number(expAgg._sum.amountNGN ?? 0);

  return {
    feedRows,
    pnlRows,
    revenue,
    expense,
    profit: revenue - expense,
    untaggedCostNGN: pnl.untaggedCostNGN,
    untaggedRevenueNGN: pnl.untaggedRevenueNGN,
  };
}

function StatCard({
  icon: Icon,
  chip,
  label,
  value,
  valueClass,
}: {
  icon: LucideIcon;
  chip: string;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            className={`text-2xl font-extrabold leading-none tracking-tight sm:text-3xl ${valueClass ?? ""}`}
          >
            {value}
          </p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
            {label}
          </p>
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-12 sm:w-12 ${chip}`}>
          <Icon size={22} strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="viz-root space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <header>
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</h2>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </header>
      {children}
    </section>
  );
}

export default async function Page() {
  const d = await getData();
  const profitColor = d.profit > 0 ? "text-green-700" : d.profit < 0 ? "text-red-600" : "";
  const hasUntagged = d.untaggedCostNGN > 0 || d.untaggedRevenueNGN > 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Where the money goes, split by species and by batch — all time
        </p>
      </header>

      {hasUntagged && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <Info size={14} className="mt-0.5 shrink-0" />
          <p>
            {naira(d.untaggedCostNGN)} of expenses and {naira(d.untaggedRevenueNGN)} of revenue
            aren’t tagged to any batch, so they’re missing from the per-batch table below. Pick a
            batch or pond when logging in{" "}
            <Link href="/farm/finance" className="font-semibold underline">
              Finance
            </Link>{" "}
            to fold them in.
          </p>
        </div>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard
          icon={TrendingUp}
          chip="bg-green-100 text-green-700"
          label="Total revenue"
          value={naira(d.revenue)}
        />
        <StatCard
          icon={TrendingDown}
          chip="bg-red-100 text-red-600"
          label="Total expenses"
          value={naira(d.expense)}
        />
        <StatCard
          icon={Scale}
          chip="bg-primary/10 text-primary"
          label="Net profit"
          value={naira(d.profit)}
          valueClass={profitColor}
        />
      </section>

      <Panel
        title="Feed spend by species"
        hint="Feed money split across broilers, layers and fish."
      >
        <FeedSpendChart rows={d.feedRows} />
      </Panel>

      <Panel
        title="Profit by batch"
        hint="Revenue minus feed and other costs tagged to each batch or pond."
      >
        <BatchProfitChart rows={d.pnlRows} />
      </Panel>
    </div>
  );
}
