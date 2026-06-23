import Link from "next/link";
import { Egg } from "lucide-react";
import { prisma } from "@/lib/db";
import HarvestEntries from "./HarvestEntries";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [groups, ponds, rows, eggLogs] = await Promise.all([
    prisma.animalGroup.findMany({ orderBy: { label: "asc" } }),
    prisma.pond.findMany({ orderBy: { label: "asc" } }),
    prisma.harvestRecord.findMany({ orderBy: { date: "desc" } }),
    prisma.eggLog.findMany({ orderBy: { date: "desc" }, take: 20 }),
  ]);

  const targets = [
    ...groups.map((g) => ({ id: `group:${g.id}`, label: `${g.label} (group)` })),
    ...ponds.map((p) => ({ id: `pond:${p.id}`, label: `${p.label} (pond)` })),
  ];

  const rowsList = rows.map((r) => ({ id: r.id, date: fmtDate(r.date), targetLabel: r.groupId ? groups.find((g) => g.id === r.groupId)?.label : r.pondId ? ponds.find((p) => p.id === r.pondId)?.label : "Farm", quantity: r.quantity, weightKg: Number(r.weightKg) }));

  const eggRows = eggLogs.map((e) => ({
    id: e.id,
    date: fmtDate(e.date),
    flock: groups.find((g) => g.id === e.groupId)?.label ?? "Flock",
    collected: e.collected,
    broken: e.broken,
    grade: e.grade,
  }));

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Harvest</h1>
          <p className="mt-1 text-sm text-muted-foreground">Record harvests, plus egg collections logged in Poultry.</p>
        </div>
      </header>

      <HarvestEntries rows={rowsList} targets={targets} />

      {/* Egg collections (logged in Poultry, shown here as a harvest) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Egg collections</h2>
          <Link href="/farm/poultry" className="text-xs font-semibold text-primary hover:underline">
            Manage in Poultry
          </Link>
        </div>

        {eggRows.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            No egg collections yet.
          </div>
        ) : (
          <div className="space-y-3">
            {eggRows.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/20 text-gold-foreground">
                    <Egg size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{e.date} • {e.flock}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {e.collected} eggs collected
                      {e.broken > 0 ? ` • ${e.broken} broken` : ""}
                      {e.grade ? ` • grade ${e.grade}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
