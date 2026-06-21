import { Wheat } from "lucide-react";
import { prisma } from "@/lib/db";
import FeedEntries, { type TargetOption, type Entry } from "./FeedEntries";

export const dynamic = "force-dynamic";

const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const fmtDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-NG", { day: "2-digit", month: "short" });
const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 2 });

async function getData() {
  const [stocks, groups, ponds, usage, purchases] = await Promise.all([
    prisma.feedStock.findMany({ orderBy: { category: "asc" } }),
    prisma.animalGroup.findMany({ where: { status: { not: "CLOSED" } }, orderBy: { label: "asc" } }),
    prisma.pond.findMany({ orderBy: { label: "asc" } }),
    prisma.feedUsage.findMany({ orderBy: { date: "desc" }, take: 60, include: { group: true, pond: true } }),
    prisma.feedPurchase.findMany({ orderBy: { date: "desc" }, take: 60 }),
  ]);

  const targets: TargetOption[] = [
    ...groups.map((g) => ({ value: `group:${g.id}`, label: g.label })),
    ...ponds.map((p) => ({ value: `pond:${p.id}`, label: p.label })),
  ];

  const isoDate = (dt: Date) => new Date(dt).toISOString().slice(0, 10);
  const entries: Entry[] = [
    ...usage.map((u) => ({
      id: u.id,
      kind: "usage" as const,
      category: u.category,
      bags: u.bags,
      date: isoDate(u.date),
      dateLabel: fmtDate(u.date),
      detail: u.group?.label ?? u.pond?.label ?? "—",
      target: u.groupId ? `group:${u.groupId}` : u.pondId ? `pond:${u.pondId}` : "",
      vendor: "",
      costNGN: 0,
      _ts: new Date(u.date).getTime(),
    })),
    ...purchases.map((p) => ({
      id: p.id,
      kind: "purchase" as const,
      category: p.category,
      bags: p.bags,
      date: isoDate(p.date),
      dateLabel: fmtDate(p.date),
      detail: p.vendor ? `${p.vendor} · ${naira(Number(p.costNGN))}` : naira(Number(p.costNGN)),
      target: "",
      vendor: p.vendor ?? "",
      costNGN: Number(p.costNGN),
      _ts: new Date(p.date).getTime(),
    })),
  ]
    .sort((a, b) => b._ts - a._ts)
    .slice(0, 60)
    .map(({ _ts, ...e }) => e);

  return { stocks, targets, entries };
}

export default async function FeedPage() {
  const { stocks, targets, entries } = await getData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Feed</h1>
        <p className="text-sm text-muted-foreground">Track daily usage and purchases</p>
      </header>

      <section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {stocks.map((s) => {
            const cap = s.capacityBags > 0 ? s.capacityBags : s.bags;
            const pct = cap > 0 ? (s.bags / cap) * 100 : 0;
            const chip =
              s.category === "BROILER"
                ? "bg-primary/10 text-primary"
                : s.category === "LAYER"
                  ? "bg-gold/20 text-gold-foreground"
                  : "bg-sky-100 text-sky-600";
            const tone =
              pct > 50
                ? "bg-green-50 text-green-700"
                : pct > 25
                  ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-600";
            return (
              <div
                key={s.category}
                className="flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
                      {s.bags}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                      {title(s.category)} feed
                    </p>
                  </div>
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-12 sm:w-12 ${chip}`}
                  >
                    <Wheat size={22} />
                  </span>
                </div>
                <div
                  className={`mt-3 flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold sm:mt-4 sm:gap-2 sm:px-3 sm:text-xs ${tone}`}
                >
                  <span className="truncate">{Math.round(pct)}% left</span>
                  <span className="ml-auto shrink-0">of {cap} bags</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <FeedEntries entries={entries} targets={targets} />
    </div>
  );
}
