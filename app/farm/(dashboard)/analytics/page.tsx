import { prisma } from "@/lib/db";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Page() {
  // basic aggregations: mortality trend (7d), feed totals, expenses by category
  const [mortality7d, feedTotals, expensesByCategory] = await Promise.all([
    prisma.$queryRaw`
      SELECT date::date AS day, SUM(quantity) AS total
      FROM "MortalityRecord"
      WHERE date >= now() - interval '7 days'
      GROUP BY day
      ORDER BY day;
    `,
    prisma.feedPurchase.groupBy({ by: ["category"], _sum: { bags: true } }).catch(() => []),
    prisma.expense.groupBy({ by: ["category"], _sum: { amountNGN: true } }).catch(() => []),
  ]);

  // Normalize mortality rows
  const mortRows = Array.isArray(mortality7d)
    ? mortality7d.map((r: any) => ({ day: fmtDate(new Date(r.day)), total: Number(r.total) }))
    : [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Read-only aggregations and trends.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Mortality (7 days)</h3>
          <div className="mt-3 text-sm">
            {mortRows.length === 0 ? <p className="text-xs text-muted-foreground">No data</p> : (
              <ul className="space-y-1">
                {mortRows.map((r: any) => (<li key={r.day} className="flex items-center justify-between"><span className="text-xs">{r.day}</span><span className="text-sm font-semibold">{r.total}</span></li>))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Feed purchased (by category)</h3>
          <div className="mt-3 text-sm">
            {feedTotals.length === 0 ? <p className="text-xs text-muted-foreground">No data</p> : (
              <ul className="space-y-1">{feedTotals.map((f: any) => (<li key={f.category} className="flex items-center justify-between"><span className="text-xs">{String(f.category)}</span><span className="text-sm font-semibold">{Number(f._sum?.bags ?? 0)}</span></li>))}</ul>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Expenses (by category)</h3>
          <div className="mt-3 text-sm">
            {expensesByCategory.length === 0 ? <p className="text-xs text-muted-foreground">No data</p> : (
              <ul className="space-y-1">{expensesByCategory.map((e: any) => (<li key={e.category} className="flex items-center justify-between"><span className="text-xs">{String(e.category)}</span><span className="text-sm font-semibold">₦{Number(e._sum?.amountNGN ?? 0).toLocaleString("en-NG")}</span></li>))}</ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
