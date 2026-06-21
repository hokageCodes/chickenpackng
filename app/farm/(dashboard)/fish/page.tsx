import { Fish, Waves, PackageOpen, TrendingDown, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import FishEntries, { type Pond } from "./FishEntries";

export const dynamic = "force-dynamic";

const isoDate = (d: Date) => new Date(d).toISOString().slice(0, 10);
const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));

async function getData() {
  const ponds = await prisma.pond.findMany({ orderBy: { label: "asc" } });

  const cards: Pond[] = ponds.map((p) => ({
    id: p.id,
    label: p.label,
    species: p.species,
    quantityStocked: p.quantityStocked,
    currentCount: p.currentCount,
    stockedDate: isoDate(p.stockedDate),
    stockedLabel: fmtDate(p.stockedDate),
  }));

  const current = ponds.reduce((a, p) => a + p.currentCount, 0);
  const stocked = ponds.reduce((a, p) => a + p.quantityStocked, 0);

  return { ponds: cards, current, stocked, pondCount: ponds.length, lost: stocked - current };
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

export default async function FishPage() {
  const d = await getData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Fish</h1>
        <p className="text-sm text-muted-foreground">Catfish ponds — stocking and losses</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Fish} chip="bg-sky-100 text-sky-600" label="Total fish" value={d.current} />
        <StatCard icon={Waves} chip="bg-primary/10 text-primary" label="Ponds" value={d.pondCount} />
        <StatCard icon={PackageOpen} chip="bg-muted text-muted-foreground" label="Stocked" value={d.stocked} />
        <StatCard icon={TrendingDown} chip="bg-red-100 text-red-600" label="Lost" value={d.lost} />
      </section>

      <FishEntries ponds={d.ponds} />
    </div>
  );
}
