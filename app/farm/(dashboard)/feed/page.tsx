import { prisma } from "@/lib/db";
import FeedEntries, { type TargetOption, type Entry } from "./FeedEntries";
import FeedStockCards, { type Stock } from "./FeedStockCards";

export const dynamic = "force-dynamic";

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

  const stockCards: Stock[] = stocks.map((s) => ({
    category: s.category,
    bags: s.bags,
    capacityBags: s.capacityBags,
    lowThreshold: s.lowThreshold,
  }));

  return { stockCards, targets, entries };
}

export default async function FeedPage() {
  const { stockCards, targets, entries } = await getData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Feed</h1>
        <p className="text-sm text-muted-foreground">Track daily usage and purchases</p>
      </header>

      <FeedStockCards stocks={stockCards} />

      <FeedEntries entries={entries} targets={targets} />
    </div>
  );
}
