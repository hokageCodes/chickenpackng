import { Wallet, ShoppingCart, Receipt, Users, BarChart3, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
const title = (s: string) =>
  s.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const ORDER_STATUSES = ["PENDING", "PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const;

function startOfMonth(offset: number) {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - offset, 1);
}

async function getData() {
  const [orders, customersByType, productCount] = await Promise.all([
    prisma.order.findMany({ include: { items: true } }),
    prisma.customer.groupBy({ by: ["type"], _count: true }),
    prisma.product.count(),
  ]);

  const gross = orders.reduce((a, o) => a + Number(o.totalNGN), 0);
  const delivered = orders.filter((o) => o.status === "DELIVERED");
  const revenue = delivered.reduce((a, o) => a + Number(o.totalNGN), 0);
  const aov = orders.length ? Math.round(gross / orders.length) : 0;

  const statusCounts = ORDER_STATUSES.map((s) => ({
    status: s,
    count: orders.filter((o) => o.status === s).length,
  }));

  // Top products by revenue (from order items).
  const byProduct = new Map<string, { qty: number; revenue: number }>();
  for (const o of orders) {
    for (const it of o.items) {
      const cur = byProduct.get(it.name) ?? { qty: 0, revenue: 0 };
      cur.qty += it.qty;
      cur.revenue += Number(it.lineTotalNGN);
      byProduct.set(it.name, cur);
    }
  }
  const topProducts = [...byProduct.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Revenue by month (last 6 months) from delivered orders.
  const months: { label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const from = startOfMonth(i);
    const to = startOfMonth(i - 1);
    const total = delivered
      .filter((o) => o.placedAt >= from && o.placedAt < to)
      .reduce((a, o) => a + Number(o.totalNGN), 0);
    months.push({
      label: new Intl.DateTimeFormat("en-NG", { month: "short" }).format(from),
      total,
    });
  }

  const customerMix = customersByType.map((c) => ({ type: c.type, count: c._count }));
  const customerTotal = customerMix.reduce((a, c) => a + c.count, 0);

  return {
    revenue,
    ordersCount: orders.length,
    aov,
    customerTotal,
    productCount,
    statusCounts,
    topProducts,
    months,
    customerMix,
  };
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
          <p className="truncate text-2xl font-extrabold leading-none tracking-tight sm:text-3xl">{value}</p>
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

const TYPE_COLOR: Record<string, string> = {
  RETAIL: "bg-sky-500",
  DISTRIBUTOR: "bg-primary",
  AGENT: "bg-gold",
};

export default async function ReportsPage() {
  const d = await getData();
  const maxStatus = Math.max(1, ...d.statusCounts.map((s) => s.count));
  const maxMonth = Math.max(1, ...d.months.map((m) => m.total));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">Sales and customer insight for Protein Pack</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Wallet} chip="bg-green-100 text-green-700" label="Revenue (delivered)" value={naira(d.revenue)} />
        <StatCard icon={ShoppingCart} chip="bg-primary/10 text-primary" label="Orders" value={d.ordersCount} />
        <StatCard icon={Receipt} chip="bg-sky-100 text-sky-600" label="Avg order value" value={naira(d.aov)} />
        <StatCard icon={Users} chip="bg-gold/20 text-gold-foreground" label="Customers" value={d.customerTotal} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {/* Revenue by month */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Revenue · last 6 months</h2>
          </div>
          {d.months.every((m) => m.total === 0) ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No delivered orders yet.</p>
          ) : (
            <div className="flex h-40 items-end justify-between gap-2">
              {d.months.map((m) => (
                <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-primary"
                      style={{ height: `${Math.max(2, (m.total / maxMonth) * 100)}%` }}
                      title={naira(m.total)}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders by status */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Orders by status</h2>
          <ul className="space-y-3">
            {d.statusCounts.map((s) => (
              <li key={s.status}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{title(s.status)}</span>
                  <span className="font-semibold">{s.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(s.count / maxStatus) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Top products */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Top products</h2>
          {d.topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <ul className="space-y-3">
              {d.topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.qty} sold</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">{naira(p.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Customers by type */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Customers by type</h2>
          {d.customerTotal === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No customers yet.</p>
          ) : (
            <>
              <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                {d.customerMix.map((c) => (
                  <div
                    key={c.type}
                    className={TYPE_COLOR[c.type] ?? "bg-muted-foreground"}
                    style={{ width: `${(c.count / d.customerTotal) * 100}%` }}
                  />
                ))}
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {d.customerMix.map((c) => (
                  <li key={c.type} className="flex items-center gap-1.5 text-xs">
                    <span className={`h-2.5 w-2.5 rounded-sm ${TYPE_COLOR[c.type] ?? "bg-muted-foreground"}`} />
                    <span className="text-muted-foreground">{title(c.type)}</span>
                    <span className="font-semibold">{c.count}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
