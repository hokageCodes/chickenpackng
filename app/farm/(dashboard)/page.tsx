import Link from "next/link";
import {
  Bird,
  Egg,
  Fish,
  HeartPulse,
  Wheat,
  Wallet,
  Skull,
  ArrowRight,
  PieChart,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { bagsToKg, fmtNum } from "./feed/units";

export const dynamic = "force-dynamic";

/* ---------- helpers ---------- */
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function greetingAndDate() {
  const now = new Date();
  const hour = Number(
    new Intl.DateTimeFormat("en-NG", {
      timeZone: "Africa/Lagos",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(now)
  );
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const date = new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  return { greeting, date };
}
const naira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/* ---------- data ---------- */
type FeedInfo = { bags: number; pct: number; category: "BROILER" | "LAYER" | "FISH" };

async function getData() {
  const [
    broilers,
    layers,
    ponds,
    feedStocks,
    totalDeaths,
    totalInitial,
    deaths7,
    expenseMonth,
    eggs7,
    feedToday,
    expenseByCategory,
  ] = await Promise.all([
    prisma.animalGroup.aggregate({
      _sum: { currentCount: true },
      where: { type: "BROILER", status: { not: "CLOSED" } },
    }),
    prisma.animalGroup.aggregate({
      _sum: { currentCount: true },
      where: { type: "LAYER", status: { not: "CLOSED" } },
    }),
    prisma.pond.aggregate({ _sum: { currentCount: true }, _count: true }),
    prisma.feedStock.findMany(),
    prisma.mortalityRecord.aggregate({ _sum: { quantity: true } }),
    prisma.animalGroup.aggregate({ _sum: { initialCount: true } }),
    prisma.mortalityRecord.aggregate({
      _sum: { quantity: true },
      where: { date: { gte: daysAgo(7) } },
    }),
    prisma.expense.aggregate({
      _sum: { amountNGN: true },
      where: { date: { gte: startOfMonth() } },
    }),
    prisma.eggLog.aggregate({
      _sum: { collected: true },
      where: { date: { gte: daysAgo(7) } },
    }),
    prisma.feedUsage.aggregate({
      _sum: { bags: true },
      where: { date: { gte: startOfToday() } },
    }),
    prisma.expense.groupBy({
      by: ["category"],
      _sum: { amountNGN: true },
      where: { date: { gte: startOfMonth() } },
    }),
  ]);

  const feed = (cat: "BROILER" | "LAYER" | "FISH"): FeedInfo => {
    const row = feedStocks.find((f) => f.category === cat);
    const bags = row?.bags ?? 0;
    const cap = row?.capacityBags ?? 0;
    const pct = cap > 0 ? (bags / cap) * 100 : bags > 0 ? 100 : 0;
    return { bags, pct, category: cat };
  };

  const deaths = totalDeaths._sum.quantity ?? 0;
  const initial = totalInitial._sum.initialCount ?? 0;

  const expenses = expenseByCategory
    .map((e) => ({ category: e.category, total: Number(e._sum.amountNGN ?? 0) }))
    .sort((a, b) => b.total - a.total);

  return {
    broilers: { count: broilers._sum.currentCount ?? 0, feed: feed("BROILER") },
    layers: { count: layers._sum.currentCount ?? 0, feed: feed("LAYER") },
    fish: { stocked: ponds._sum.currentCount ?? 0, ponds: ponds._count, feed: feed("FISH") },
    mortalityRate: initial > 0 ? (deaths / initial) * 100 : 0,
    deaths7: deaths7._sum.quantity ?? 0,
    expenseMonth: Number(expenseMonth._sum.amountNGN ?? 0),
    eggs7: eggs7._sum.collected ?? 0,
    feedToday: feedToday._sum.bags ?? 0,
    expenses,
  };
}

/* ---------- UI bits ---------- */
function FeedStrip({ feed }: { feed: FeedInfo }) {
  const tone =
    feed.pct > 50
      ? "bg-green-50 text-green-700"
      : feed.pct > 25
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-600";
  return (
    <div
      className={`mt-3 flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold sm:mt-4 sm:gap-2 sm:px-3 sm:text-xs ${tone}`}
    >
      <Wheat size={13} className="shrink-0" />
      <span className="truncate">{fmtNum(bagsToKg(feed.bags, feed.category))} kg left</span>
      <span className="ml-auto shrink-0">{Math.round(feed.pct)}%</span>
    </div>
  );
}

function StatCard({
  icon: Icon,
  chip,
  label,
  value,
  footer,
}: {
  icon: LucideIcon;
  chip: string;
  label: string;
  value: string | number;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
            {value}
          </p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
            {label}
          </p>
        </div>
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-12 sm:w-12 ${chip}`}
        >
          <Icon size={22} strokeWidth={2} />
        </span>
      </div>
      {footer}
    </div>
  );
}

const QUICK_ACTIONS: { href: string; label: string; icon: LucideIcon; chip: string }[] = [
  { href: "/farm/mortality", label: "Log mortality", icon: Skull, chip: "bg-red-100 text-red-600" },
  { href: "/farm/feed", label: "Log feed", icon: Wheat, chip: "bg-green-100 text-green-700" },
  { href: "/farm/finance", label: "Log expense", icon: Wallet, chip: "bg-primary/10 text-primary" },
];

function MiniStat({
  icon: Icon,
  chip,
  label,
  value,
}: {
  icon: LucideIcon;
  chip: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${chip}`}>
        <Icon size={17} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-tight">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/* ---------- page ---------- */
export default async function FarmDashboard() {
  const [d, session] = await Promise.all([getData(), auth()]);
  const { greeting, date } = greetingAndDate();
  const firstName = session?.user?.name?.split(" ")[0];

  const expMax = Math.max(1, ...d.expenses.map((e) => e.total));
  const mix = [
    { label: "Broilers", value: d.broilers.count, color: "bg-primary" },
    { label: "Layers", value: d.layers.count, color: "bg-gold" },
    { label: "Fish", value: d.fish.stocked, color: "bg-sky-500" },
  ];
  const mixTotal = mix.reduce((a, m) => a + m.value, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">
          {greeting}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          {date} at{" "}
          <span className="align-middle text-lg font-extrabold uppercase tracking-wide text-primary">
            Sinum Agro
          </span>
        </p>
      </header>

      {/* Livestock + mortality (feed folded into each card) */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Livestock &amp; health
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Bird}
          chip="bg-primary/10 text-primary"
          label="Broilers"
          value={d.broilers.count}
          footer={<FeedStrip feed={d.broilers.feed} />}
        />
        <StatCard
          icon={Egg}
          chip="bg-gold/20 text-gold-foreground"
          label="Layers"
          value={d.layers.count}
          footer={<FeedStrip feed={d.layers.feed} />}
        />
        <StatCard
          icon={Fish}
          chip="bg-sky-100 text-sky-600"
          label="Fish Ponds"
          value={d.fish.ponds}
          footer={<FeedStrip feed={d.fish.feed} />}
        />
        <StatCard
          icon={HeartPulse}
          chip="bg-red-100 text-red-600"
          label="Mortality Rate"
          value={`${d.mortalityRate.toFixed(1)}%`}
          footer={
            <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-2 text-[11px] font-semibold text-muted-foreground sm:mt-4 sm:gap-2 sm:px-3 sm:text-xs">
              <Skull size={13} className="shrink-0" />
              <span className="truncate">
                {d.deaths7} death{d.deaths7 !== 1 ? "s" : ""} · 7 days
              </span>
            </div>
          }
        />
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Quick logs
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-primary/5"
          >
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${a.chip}`}>
              <a.icon size={18} />
            </span>
            <span className="flex-1 text-sm font-semibold">{a.label}</span>
            <ArrowRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
        </div>
      </section>

      {/* Analytics + snapshot */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Analytics
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
        {/* Analytics */}
        <div className="space-y-6 rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          {/* Expenses by category */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart size={16} className="text-muted-foreground" />
                <h2 className="text-sm font-semibold">Expenses by category</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                {naira(d.expenseMonth)} this month
              </p>
            </div>
            {d.expenses.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No expenses logged this month.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {d.expenses.map((e) => (
                  <li key={e.category}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium">{title(e.category)}</span>
                      <span className="font-semibold">{naira(e.total)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.max(4, (e.total / expMax) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Livestock mix */}
          <div className="border-t border-border pt-5">
            <h2 className="text-sm font-semibold">Livestock mix</h2>
            {mixTotal === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No livestock recorded.</p>
            ) : (
              <>
                <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-muted">
                  {mix.map(
                    (m) =>
                      m.value > 0 && (
                        <div
                          key={m.label}
                          className={m.color}
                          style={{ width: `${(m.value / mixTotal) * 100}%` }}
                        />
                      )
                  )}
                </div>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {mix.map((m) => (
                    <li key={m.label} className="flex items-center gap-1.5 text-xs">
                      <span className={`h-2.5 w-2.5 rounded-sm ${m.color}`} />
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className="font-semibold">{m.value}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Snapshot */}
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Snapshot</h2>
          <MiniStat
            icon={Wallet}
            chip="bg-primary/10 text-primary"
            value={naira(d.expenseMonth)}
            label="Expenses this month"
          />
          <MiniStat
            icon={Egg}
            chip="bg-gold/20 text-gold-foreground"
            value={d.eggs7.toLocaleString("en-NG")}
            label="Eggs collected (7 days)"
          />
          <MiniStat
            icon={Wheat}
            chip="bg-green-100 text-green-700"
            value={`${d.feedToday} bags`}
            label="Feed used today"
          />
          <Link
            href="/farm/finance"
            className="flex items-center justify-center gap-1 rounded-lg border border-border py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            View finance <ArrowRight size={14} />
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-center gap-1 rounded-lg border border-primary bg-primary/10 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            Open Commerce Admin <ArrowRight size={14} />
          </Link>
        </div>
        </div>
      </section>
    </div>
  );
}
