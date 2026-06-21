import { prisma } from "@/lib/db";
import ExpenseForm, { type TargetOption } from "./ExpenseForm";

export const dynamic = "force-dynamic";

const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 2 });
const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const fmtDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

async function getData() {
  const [groups, ponds, expenses, monthAgg, byCategory] = await Promise.all([
    prisma.animalGroup.findMany({ where: { status: { not: "CLOSED" } }, orderBy: { label: "asc" } }),
    prisma.pond.findMany({ orderBy: { label: "asc" } }),
    prisma.expense.findMany({ orderBy: { date: "desc" }, take: 25, include: { group: true, pond: true } }),
    prisma.expense.aggregate({ _sum: { amountNGN: true }, where: { date: { gte: startOfMonth() } } }),
    prisma.expense.groupBy({
      by: ["category"],
      _sum: { amountNGN: true },
      where: { date: { gte: startOfMonth() } },
    }),
  ]);

  const targets: TargetOption[] = [
    ...groups.map((g) => ({ value: `group:${g.id}`, label: g.label })),
    ...ponds.map((p) => ({ value: `pond:${p.id}`, label: p.label })),
  ];

  const breakdown = byCategory
    .map((b) => ({ category: b.category, total: Number(b._sum.amountNGN ?? 0) }))
    .sort((a, b) => b.total - a.total);

  return {
    targets,
    expenses,
    monthTotal: Number(monthAgg._sum.amountNGN ?? 0),
    breakdown,
  };
}

export default async function FinancePage() {
  const { targets, expenses, monthTotal, breakdown } = await getData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Finance</h1>
        <p className="text-sm text-neutral-500">Track expenses (revenue coming soon)</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-xs uppercase text-neutral-500">Expenses this month</p>
          <p className="mt-2 text-2xl font-bold">{naira(monthTotal)}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 lg:col-span-2">
          <p className="mb-2 text-xs uppercase text-neutral-500">By category (this month)</p>
          {breakdown.length === 0 ? (
            <p className="text-sm text-neutral-500">No expenses this month.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {breakdown.map((b) => (
                <li key={b.category} className="rounded-lg bg-neutral-50 px-3 py-1.5 text-sm">
                  <span className="text-neutral-500">{title(b.category)}: </span>
                  <span className="font-medium">{naira(b.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ExpenseForm targets={targets} />

      <section className="rounded-2xl border border-neutral-200 bg-white">
        <h2 className="border-b border-neutral-100 px-5 py-3 text-sm font-semibold text-neutral-700">
          Recent expenses
        </h2>
        {expenses.length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-500">No expenses recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-neutral-500">
                <tr className="border-b border-neutral-100">
                  <th className="px-5 py-2 font-medium">Date</th>
                  <th className="px-5 py-2 font-medium">Category</th>
                  <th className="px-5 py-2 font-medium">Amount</th>
                  <th className="px-5 py-2 font-medium">Vendor</th>
                  <th className="px-5 py-2 font-medium">For</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b border-neutral-50 last:border-0">
                    <td className="px-5 py-2.5 text-neutral-600">{fmtDate(e.date)}</td>
                    <td className="px-5 py-2.5">{title(e.category)}</td>
                    <td className="px-5 py-2.5 font-medium">{naira(Number(e.amountNGN))}</td>
                    <td className="px-5 py-2.5 text-neutral-600">{e.vendor ?? "—"}</td>
                    <td className="px-5 py-2.5 text-neutral-600">
                      {e.group?.label ?? e.pond?.label ?? "—"}
                    </td>
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
