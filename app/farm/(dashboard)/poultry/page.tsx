import { Bird, Egg, LayoutGrid, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import PoultryEntries, { type Group } from "./PoultryEntries";

export const dynamic = "force-dynamic";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
const isoDate = (d: Date) => new Date(d).toISOString().slice(0, 10);
const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));

async function getData() {
  const [groups, eggByGroup, broilerAgg, layerAgg, activeCount, eggs7] = await Promise.all([
    prisma.animalGroup.findMany({ orderBy: [{ status: "asc" }, { arrivalDate: "desc" }] }),
    prisma.eggLog.groupBy({ by: ["groupId"], _sum: { collected: true }, where: { date: { gte: daysAgo(7) } } }),
    prisma.animalGroup.aggregate({ _sum: { currentCount: true }, where: { type: "BROILER", status: { not: "CLOSED" } } }),
    prisma.animalGroup.aggregate({ _sum: { currentCount: true }, where: { type: "LAYER", status: { not: "CLOSED" } } }),
    prisma.animalGroup.count({ where: { status: { not: "CLOSED" } } }),
    prisma.eggLog.aggregate({ _sum: { collected: true }, where: { date: { gte: daysAgo(7) } } }),
  ]);

  const eggMap = new Map(eggByGroup.map((e) => [e.groupId, e._sum.collected ?? 0]));

  const cards: Group[] = groups.map((g) => ({
    id: g.id,
    type: g.type,
    label: g.label,
    breed: g.breed ?? "",
    arrivalLabel: fmtDate(g.arrivalDate),
    initialCount: g.initialCount,
    currentCount: g.currentCount,
    status: g.status,
    expectedHarvest: g.expectedHarvest ? isoDate(g.expectedHarvest) : "",
    houseName: g.houseName ?? "",
    eggs7: eggMap.get(g.id) ?? 0,
  }));

  return {
    groups: cards,
    broilers: broilerAgg._sum.currentCount ?? 0,
    layers: layerAgg._sum.currentCount ?? 0,
    active: activeCount,
    eggs7: eggs7._sum.collected ?? 0,
  };
}

function StatCard({
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
    <div className="flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">{value}</p>
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

export default async function PoultryPage() {
  const d = await getData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Poultry</h1>
        <p className="text-sm text-muted-foreground">Broiler batches and layer flocks</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Bird} chip="bg-primary/10 text-primary" label="Broilers" value={d.broilers} />
        <StatCard icon={Egg} chip="bg-gold/20 text-gold-foreground" label="Layers" value={d.layers} />
        <StatCard icon={LayoutGrid} chip="bg-sky-100 text-sky-600" label="Active groups" value={d.active} />
        <StatCard icon={Egg} chip="bg-gold/20 text-gold-foreground" label="Eggs · 7 days" value={d.eggs7} />
      </section>

      <PoultryEntries groups={d.groups} />
    </div>
  );
}
