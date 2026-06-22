import { ShoppingCart, Clock, CheckCircle2, Wallet, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import OrdersList, { type Order } from "./OrdersList";

export const dynamic = "force-dynamic";

const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "2-digit",
    month: "short",
  }).format(new Date(d));

async function getData() {
  const rows = await prisma.order.findMany({
    orderBy: { placedAt: "desc" },
    include: { customer: true, items: true },
  });

  const orders: Order[] = rows.map((o) => ({
    id: o.id,
    ref: `ORD-${o.number}`,
    customer: o.customer.name,
    type: title(o.customer.type),
    status: o.status,
    dateLabel: fmtDate(o.placedAt),
    items: o.items.map((i) => ({
      name: i.name,
      qty: i.qty,
      price: Number(i.unitPriceNGN),
    })),
  }));

  const pending = orders.filter((o) => o.status === "PENDING").length;
  const delivered = orders.filter((o) => o.status === "DELIVERED");
  const revenue = rows
    .filter((o) => o.status === "DELIVERED")
    .reduce((a, o) => a + Number(o.totalNGN), 0);

  return { orders, pending, deliveredCount: delivered.length, revenue };
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

export default async function OrdersPage() {
  const d = await getData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">Customer orders across retail, distributors and agents</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={ShoppingCart} chip="bg-primary/10 text-primary" label="Total orders" value={d.orders.length} />
        <StatCard icon={Clock} chip="bg-amber-100 text-amber-700" label="Pending" value={d.pending} />
        <StatCard icon={CheckCircle2} chip="bg-green-100 text-green-700" label="Delivered" value={d.deliveredCount} />
        <StatCard icon={Wallet} chip="bg-sky-100 text-sky-600" label="Revenue" value={naira(d.revenue)} />
      </section>

      <OrdersList orders={d.orders} />
    </div>
  );
}
