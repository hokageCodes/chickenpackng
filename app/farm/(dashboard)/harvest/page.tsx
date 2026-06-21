import { prisma } from "@/lib/db";
import HarvestEntries from "./HarvestEntries";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [groups, ponds, rows] = await Promise.all([
    prisma.animalGroup.findMany({ orderBy: { label: "asc" } }),
    prisma.pond.findMany({ orderBy: { label: "asc" } }),
    prisma.harvestRecord.findMany({ orderBy: { date: "desc" } }),
  ]);

  const targets = [
    ...groups.map((g) => ({ id: `group:${g.id}`, label: `${g.label} (group)` })),
    ...ponds.map((p) => ({ id: `pond:${p.id}`, label: `${p.label} (pond)` })),
  ];

  const rowsList = rows.map((r) => ({ id: r.id, date: fmtDate(r.date), targetLabel: r.groupId ? groups.find((g) => g.id === r.groupId)?.label : r.pondId ? ponds.find((p) => p.id === r.pondId)?.label : "Farm", quantity: r.quantity, weightKg: Number(r.weightKg) }));

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Harvest</h1>
          <p className="mt-1 text-sm text-muted-foreground">Record harvests and move product into Inventory.</p>
        </div>
      </header>

      <HarvestEntries rows={rowsList} targets={targets} />
    </div>
  );
}
