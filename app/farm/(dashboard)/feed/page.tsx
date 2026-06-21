import { prisma } from "@/lib/db";
import FeedForms, { type TargetOption } from "./FeedForms";

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
    prisma.feedUsage.findMany({ orderBy: { date: "desc" }, take: 15, include: { group: true, pond: true } }),
    prisma.feedPurchase.findMany({ orderBy: { date: "desc" }, take: 15 }),
  ]);

  const targets: TargetOption[] = [
    ...groups.map((g) => ({ value: `group:${g.id}`, label: g.label })),
    ...ponds.map((p) => ({ value: `pond:${p.id}`, label: p.label })),
  ];

  type Row = { id: string; date: Date; kind: "Used" | "Bought"; category: string; bags: number; detail: string };
  const activity: Row[] = [
    ...usage.map((u) => ({
      id: u.id,
      date: u.date,
      kind: "Used" as const,
      category: u.category,
      bags: u.bags,
      detail: u.group?.label ?? u.pond?.label ?? "—",
    })),
    ...purchases.map((p) => ({
      id: p.id,
      date: p.date,
      kind: "Bought" as const,
      category: p.category,
      bags: p.bags,
      detail: p.vendor ? `${p.vendor} · ${naira(Number(p.costNGN))}` : naira(Number(p.costNGN)),
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 20);

  return { stocks, targets, activity };
}

export default async function FeedPage() {
  const { stocks, targets, activity } = await getData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Feed</h1>
        <p className="text-sm text-neutral-500">Track daily usage and purchases</p>
      </header>

      <section className="grid grid-cols-3 gap-4">
        {stocks.map((s) => {
          const low = s.bags <= s.lowThreshold;
          return (
            <div key={s.category} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <p className="text-xs uppercase text-neutral-500">{title(s.category)}</p>
              <p className="mt-1 text-2xl font-bold">
                {s.bags} <span className="text-sm font-normal text-neutral-500">bags</span>
              </p>
              {low && <span className="text-xs font-medium text-red-600">Low stock</span>}
            </div>
          );
        })}
      </section>

      <FeedForms targets={targets} />

      <section className="rounded-2xl border border-neutral-200 bg-white">
        <h2 className="border-b border-neutral-100 px-5 py-3 text-sm font-semibold text-neutral-700">
          Recent activity
        </h2>
        {activity.length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-500">No feed activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-neutral-500">
                <tr className="border-b border-neutral-100">
                  <th className="px-5 py-2 font-medium">Date</th>
                  <th className="px-5 py-2 font-medium">Action</th>
                  <th className="px-5 py-2 font-medium">Feed</th>
                  <th className="px-5 py-2 font-medium">Bags</th>
                  <th className="px-5 py-2 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((r) => (
                  <tr key={`${r.kind}-${r.id}`} className="border-b border-neutral-50 last:border-0">
                    <td className="px-5 py-2.5 text-neutral-600">{fmtDate(r.date)}</td>
                    <td className="px-5 py-2.5">
                      <span
                        className={
                          "rounded px-1.5 py-0.5 text-xs font-medium " +
                          (r.kind === "Bought"
                            ? "bg-green-50 text-green-700"
                            : "bg-neutral-100 text-neutral-700")
                        }
                      >
                        {r.kind}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-neutral-600">{title(r.category)}</td>
                    <td className="px-5 py-2.5 font-medium">{r.bags}</td>
                    <td className="px-5 py-2.5 text-neutral-600">{r.detail}</td>
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
