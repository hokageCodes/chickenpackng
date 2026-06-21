import { prisma } from "@/lib/db";
import MedicationEntries from "./MedicationEntries";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [meds, events, groups, ponds] = await Promise.all([
    prisma.medication.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.healthEvent.findMany({ orderBy: { date: "desc" }, include: { medication: true } }),
    prisma.animalGroup.findMany({ orderBy: { label: "asc" } }),
    prisma.pond.findMany({ orderBy: { label: "asc" } }),
  ]);

  const medList = meds.map((m) => ({
    id: m.id,
    name: m.name,
    quantity: Number(m.quantity),
    unit: m.unit,
    purchaseDate: m.purchaseDate ? m.purchaseDate.toISOString().slice(0, 10) : null,
    expiryDate: m.expiryDate ? m.expiryDate.toISOString().slice(0, 10) : null,
    remaining: Number(m.remaining),
  }));

  const targets = [
    ...groups.map((g) => ({ id: `group:${g.id}`, label: `${g.label} (group)` })),
    ...ponds.map((p) => ({ id: `pond:${p.id}`, label: `${p.label} (pond)` })),
  ];

  const eventList = events.map((e) => ({
    id: e.id,
    type: e.type,
    date: fmtDate(e.date),
    targetLabel: e.groupId ? groups.find((g) => g.id === e.groupId)?.label : e.pondId ? ponds.find((p) => p.id === e.pondId)?.label : "Whole farm",
    medicationId: e.medicationId ?? null,
    dosage: e.dosage ?? null,
    notes: e.notes ?? null,
  }));

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Medication</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage medication stock and health events.</p>
        </div>
      </header>

      <MedicationEntries meds={medList} events={eventList} targets={targets} />
    </div>
  );
}
