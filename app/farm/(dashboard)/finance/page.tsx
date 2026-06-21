import { TrendingUp, TrendingDown, Scale, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import FinanceEntries, { type TargetOption, type Entry } from "./FinanceEntries";

export const dynamic = "force-dynamic";

const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const isoDate = (d: Date) => new Date(d).toISOString().slice(0, 10);
const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

async function getData() {
  const [groups, ponds, expenses, revenues, expMonth, revMonth] = await Promise.all([
    prisma.animalGroup.findMany({ where: { status: { not: "CLOSED" } }, orderBy: { label: "asc" } }),
    prisma.pond.findMany({ orderBy: { label: "asc" } }),
    prisma.expense.findMany({ orderBy: { date: "desc" }, take: 60, include: { group: true, pond: true } }),
    prisma.revenue.findMany({ orderBy: { date: "desc" }, take: 60, include: { group: true, pond: true } }),
    prisma.expense.aggregate({ _sum: { amountNGN: true }, where: { date: { gte: startOfMonth() } } }),
    prisma.revenue.aggregate({ _sum: { amountNGN: true }, where: { date: { gte: startOfMonth() } } }),
  ]);

  const targets: TargetOption[] = [
    ...groups.map((g) => ({ value: `group:${g.id}`, label: g.label })),
    ...ponds.map((p) => ({ value: `pond:${p.id}`, label: p.label })),
  ];

  const entries: Entry[] = [
    ...expenses.map((e) => ({
      id: e.id,
      kind: "expense" as const,
      label: title(e.category),
      rawCategory: e.category,
      amount: Number(e.amountNGN),
      date: isoDate(e.date),
      dateLabel: fmtDate(e.date),
      party: e.vendor ?? "",
      notes: e.notes ?? "",
      target: e.groupId ? `group:${e.groupId}` : e.pondId ? `pond:${e.pondId}` : "",
      _ts: new Date(e.date).getTime(),
    })),
    ...revenues.map((r) => ({
      id: r.id,
      kind: "revenue" as const,
      label: title(r.source),
      rawCategory: r.source,
      amount: Number(r.amountNGN),
      date: isoDate(r.date),
      dateLabel: fmtDate(r.date),
      party: r.customer ?? "",
      notes: r.notes ?? "",
      target: r.groupId ? `group:${r.groupId}` : r.pondId ? `pond:${r.pondId}` : "",
      _ts: new Date(r.date).getTime(),
    })),
  ]
    .sort((a, b) => b._ts - a._ts)
    .slice(0, 80)
    .map(({ _ts, ...e }) => e);

  const expense = Number(expMonth._sum.amountNGN ?? 0);
  const revenue = Number(revMonth._sum.amountNGN ?? 0);

  return { targets, entries, expense, revenue, profit: revenue - expense };
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
          <p className={`text-2xl font-extrabold leading-none tracking-tight sm:text-3xl ${valueClass ?? ""}`}>
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

export default async function FinancePage() {
  const d = await getData();
  const profitColor = d.profit > 0 ? "text-green-700" : d.profit < 0 ? "text-red-600" : "";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Finance</h1>
        <p className="text-sm text-muted-foreground">Revenue, expenses and profit this month</p>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard
          icon={TrendingUp}
          chip="bg-green-100 text-green-700"
          label="Revenue (this month)"
          value={naira(d.revenue)}
        />
        <StatCard
          icon={TrendingDown}
          chip="bg-red-100 text-red-600"
          label="Expenses (this month)"
          value={naira(d.expense)}
        />
        <StatCard
          icon={Scale}
          chip="bg-primary/10 text-primary"
          label="Net profit (this month)"
          value={naira(d.profit)}
          valueClass={profitColor}
        />
      </section>

      <FinanceEntries entries={d.entries} targets={d.targets} />
    </div>
  );
}
