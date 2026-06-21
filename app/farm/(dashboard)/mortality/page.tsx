import { prisma } from "@/lib/db";
import MortalityForm, { type TargetOption } from "./MortalityForm";

export const dynamic = "force-dynamic";

async function getData() {
  const [groups, ponds, records, totalDeaths, totalInitial] = await Promise.all([
    prisma.animalGroup.findMany({
      where: { status: { not: "CLOSED" } },
      orderBy: { label: "asc" },
    }),
    prisma.pond.findMany({ orderBy: { label: "asc" } }),
    prisma.mortalityRecord.findMany({
      orderBy: { date: "desc" },
      take: 25,
      include: { group: true, pond: true },
    }),
    prisma.mortalityRecord.aggregate({ _sum: { quantity: true } }),
    prisma.animalGroup.aggregate({ _sum: { initialCount: true } }),
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

  const deaths = totalDeaths._sum.quantity ?? 0;
  const initial = totalInitial._sum.initialCount ?? 0;
  const rate = initial > 0 ? (deaths / initial) * 100 : 0;

  return { targets, records, deaths, rate };
}

const fmtDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default async function MortalityPage() {
  const { targets, records, deaths, rate } = await getData();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Mortality</h1>
          <p className="text-sm text-neutral-500">Record every death to track losses</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-right">
          <p className="text-xs uppercase text-neutral-500">Mortality rate</p>
          <p className="text-xl font-bold">{rate.toFixed(1)}%</p>
          <p className="text-xs text-neutral-500">{deaths} total deaths</p>
        </div>
      </header>

      <MortalityForm targets={targets} />

      <section className="rounded-2xl border border-neutral-200 bg-white">
        <h2 className="border-b border-neutral-100 px-5 py-3 text-sm font-semibold text-neutral-700">
          Recent records
        </h2>
        {records.length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-500">No deaths recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-neutral-500">
                <tr className="border-b border-neutral-100">
                  <th className="px-5 py-2 font-medium">Date</th>
                  <th className="px-5 py-2 font-medium">Where</th>
                  <th className="px-5 py-2 font-medium">Animal</th>
                  <th className="px-5 py-2 font-medium">Qty</th>
                  <th className="px-5 py-2 font-medium">Cause</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-neutral-50 last:border-0">
                    <td className="px-5 py-2.5 text-neutral-600">{fmtDate(r.date)}</td>
                    <td className="px-5 py-2.5">{r.group?.label ?? r.pond?.label ?? "—"}</td>
                    <td className="px-5 py-2.5 capitalize text-neutral-600">{r.animalType}</td>
                    <td className="px-5 py-2.5 font-medium">{r.quantity}</td>
                    <td className="px-5 py-2.5 text-neutral-600">{r.cause ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
