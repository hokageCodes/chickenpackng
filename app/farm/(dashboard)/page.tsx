import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getDashboard() {
  const [
    broilers,
    layers,
    pondCount,
    feedStocks,
    totalMortality,
    totalInitial,
    recentMortality,
    recentExpenses,
    todayFeed,
  ] = await Promise.all([
    prisma.animalGroup.aggregate({
      _sum: { currentCount: true },
      where: { type: "BROILER", status: { not: "CLOSED" } },
    }),
    prisma.animalGroup.aggregate({
      _sum: { currentCount: true },
      where: { type: "LAYER", status: { not: "CLOSED" } },
    }),
    prisma.pond.count(),
    prisma.feedStock.findMany({ orderBy: { category: "asc" } }),
    prisma.mortalityRecord.aggregate({ _sum: { quantity: true } }),
    prisma.animalGroup.aggregate({ _sum: { initialCount: true } }),
    prisma.mortalityRecord.aggregate({
      _sum: { quantity: true },
      where: { date: { gte: daysAgo(7) } },
    }),
    prisma.expense.aggregate({
      _sum: { amountNGN: true },
      where: { date: { gte: daysAgo(7) } },
    }),
    prisma.feedUsage.aggregate({
      _sum: { bags: true },
      where: { date: { gte: startOfToday() } },
    }),
  ]);

  const deaths = totalMortality._sum.quantity ?? 0;
  const initial = totalInitial._sum.initialCount ?? 0;
  const mortalityRate = initial > 0 ? (deaths / initial) * 100 : 0;

  return {
    broilers: broilers._sum.currentCount ?? 0,
    layers: layers._sum.currentCount ?? 0,
    ponds: pondCount,
    feedStocks,
    mortalityRate,
    recentMortality: recentMortality._sum.quantity ?? 0,
    recentExpenses: Number(recentExpenses._sum.amountNGN ?? 0),
    todayFeed: todayFeed._sum.bags ?? 0,
  };
}

const naira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 2 });

function Card({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-neutral-500">{sub}</p>}
    </div>
  );
}

export default async function FarmDashboard() {
  const d = await getDashboard();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-neutral-500">Today at Protein Park</p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card label="Broilers" value={d.broilers} />
        <Card label="Layers" value={d.layers} />
        <Card label="Fish Ponds" value={d.ponds} />
        <Card
          label="Mortality Rate"
          value={`${d.mortalityRate.toFixed(1)}%`}
          sub={`${d.recentMortality} deaths (7d)`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">
            Feed remaining
          </h2>
          {d.feedStocks.length === 0 ? (
            <p className="text-sm text-neutral-500">No feed stock recorded.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-3">
              {d.feedStocks.map((f) => {
                const low = f.bags <= f.lowThreshold;
                return (
                  <li
                    key={f.category}
                    className="rounded-xl border border-neutral-100 bg-neutral-50 p-3"
                  >
                    <p className="text-xs uppercase text-neutral-500">
                      {f.category}
                    </p>
                    <p className="text-lg font-bold">
                      {f.bags} <span className="text-xs font-normal">bags</span>
                    </p>
                    {low && (
                      <span className="text-xs font-medium text-red-600">
                        Low stock
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <Card label="Today's feed usage" value={`${d.todayFeed} bags`} />
          <Card label="Expenses (7d)" value={naira(d.recentExpenses)} />
        </div>
      </section>
    </div>
  );
}
