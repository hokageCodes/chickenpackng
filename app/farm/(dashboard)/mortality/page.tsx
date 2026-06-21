import {
  HeartPulse,
  Skull,
  TrendingDown,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/db";
import MortalityEntries, { type TargetOption, type Entry } from "./MortalityEntries";

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
  const [groups, ponds, records, totalDeaths, totalInitial, deaths7, deaths30] =
    await Promise.all([
      prisma.animalGroup.findMany({ where: { status: { not: "CLOSED" } }, orderBy: { label: "asc" } }),
      prisma.pond.findMany({ orderBy: { label: "asc" } }),
      prisma.mortalityRecord.findMany({
        orderBy: { date: "desc" },
        take: 60,
        include: { group: true, pond: true },
      }),
      prisma.mortalityRecord.aggregate({ _sum: { quantity: true } }),
      prisma.animalGroup.aggregate({ _sum: { initialCount: true } }),
      prisma.mortalityRecord.aggregate({ _sum: { quantity: true }, where: { date: { gte: daysAgo(7) } } }),
      prisma.mortalityRecord.aggregate({ _sum: { quantity: true }, where: { date: { gte: daysAgo(30) } } }),
    ]);

  const targets: TargetOption[] = [
    ...groups.map((g) => ({
      value: `group:${g.id}`,
      label: `${g.label} (${g.type === "BROILER" ? "broilers" : "layers"}, ${g.currentCount} left)`,
    })),
    ...ponds.map((p) => ({
      value: `pond:${p.id}`,
      label: `${p.label} (${p.species}, ${p.currentCount} left)`,
    })),
  ];

  const entries: Entry[] = records.map((r) => ({
    id: r.id,
    date: isoDate(r.date),
    dateLabel: fmtDate(r.date),
    animalType: r.animalType,
    location: r.group?.label ?? r.pond?.label ?? "—",
    target: r.groupId ? `group:${r.groupId}` : r.pondId ? `pond:${r.pondId}` : "",
    quantity: r.quantity,
    cause: r.cause ?? "",
    notes: r.notes ?? "",
  }));

  const deaths = totalDeaths._sum.quantity ?? 0;
  const initial = totalInitial._sum.initialCount ?? 0;

  return {
    targets,
    entries,
    deaths,
    initial,
    rate: initial > 0 ? (deaths / initial) * 100 : 0,
    deaths7: deaths7._sum.quantity ?? 0,
    deaths30: deaths30._sum.quantity ?? 0,
  };
}

function StatCard({
  icon: Icon,
  chip,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  chip: string;
  label: string;
  value: string | number;
  note?: string;
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
      {note && (
        <p className="mt-3 truncate text-[11px] font-medium text-muted-foreground sm:mt-4 sm:text-xs">
          {note}
        </p>
      )}
    </div>
  );
}

export default async function MortalityPage() {
  const d = await getData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Mortality</h1>
        <p className="text-sm text-muted-foreground">Record every death to track losses</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={HeartPulse}
          chip="bg-red-100 text-red-600"
          label="Mortality Rate"
          value={`${d.rate.toFixed(1)}%`}
          note={`${d.deaths} of ${d.initial} placed`}
        />
        <StatCard icon={Skull} chip="bg-red-100 text-red-600" label="Total Deaths" value={d.deaths} />
        <StatCard
          icon={TrendingDown}
          chip="bg-amber-100 text-amber-700"
          label="Last 7 days"
          value={d.deaths7}
        />
        <StatCard
          icon={CalendarDays}
          chip="bg-muted text-muted-foreground"
          label="Last 30 days"
          value={d.deaths30}
        />
      </section>

      <MortalityEntries entries={d.entries} targets={d.targets} />
    </div>
  );
}
