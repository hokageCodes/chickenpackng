import Link from "next/link";
import {
  Wallet,
  ShoppingCart,
  Users,
  Package,
  Clock,
  Star,
  BellRing,
  Plus,
  Ticket,
  Truck,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-NG", { timeZone: "Africa/Lagos", day: "2-digit", month: "short" }).format(new Date(d));

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-NG", { timeZone: "Africa/Lagos", hour: "2-digit", hourCycle: "h23" }).format(new Date())
  );
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-sky-100 text-sky-600",
  OUT_FOR_DELIVERY: "bg-primary/10 text-primary",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

async function getData() {
  const [
    session,
    ordersTotal,
    pendingOrders,
    revenueAgg,
    customers,
    roleRequests,
    products,
    pendingReviews,
    recent,
  ] = await Promise.all([
    auth(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({ _sum: { totalNGN: true }, where: { status: "DELIVERED" } }),
    prisma.customer.count(),
    prisma.customer.count({ where: { requestedType: { not: null } } }),
    prisma.product.count(),
    prisma.review.count({ where: { approved: false } }),
    prisma.order.findMany({ orderBy: { placedAt: "desc" }, take: 5, include: { customer: true, items: true } }),
  ]);

  const recentOrders = recent.map((o) => ({
    ref: `ORD-${o.number}`,
    customer: o.customer.name,
    total: o.items.reduce((a, i) => a + i.qty * Number(i.unitPriceNGN), 0),
    status: o.status as string,
    dateLabel: fmtDate(o.placedAt),
  }));

  return {
    firstName: session?.user?.name?.split(" ")[0],
    revenue: Number(revenueAgg._sum.totalNGN ?? 0),
    ordersTotal,
    pendingOrders,
    customers,
    roleRequests,
    products,
    pendingReviews,
    recentOrders,
  };
}

function StatCard({ icon: Icon, chip, label, value }: { icon: LucideIcon; chip: string; label: string; value: string | number }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-2xl font-extrabold leading-none tracking-tight sm:text-3xl">{value}</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">{label}</p>
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-12 sm:w-12 ${chip}`}>
          <Icon size={22} strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}

function Attention({ icon: Icon, label, count, href }: { icon: LucideIcon; label: string; count: number; href: string }) {
  const active = count > 0;
  return (
    <Link
      href={href}
      className={
        "flex items-center gap-3 rounded-xl border p-4 transition-colors " +
        (active ? "border-amber-200 bg-amber-50 hover:bg-amber-100" : "border-border bg-card hover:bg-muted/40")
      }
    >
      <span className={"grid h-9 w-9 shrink-0 place-items-center rounded-full " + (active ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground")}>
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-bold leading-none">{count}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <ArrowRight size={16} className="text-muted-foreground" />
    </Link>
  );
}

const QUICK_ACTIONS: { href: string; label: string; icon: LucideIcon; chip: string }[] = [
  { href: "/shop/products", label: "Add product", icon: Plus, chip: "bg-primary/10 text-primary" },
  { href: "/shop/discounts", label: "New discount", icon: Ticket, chip: "bg-gold/20 text-gold-foreground" },
  { href: "/shop/orders", label: "View orders", icon: ShoppingCart, chip: "bg-sky-100 text-sky-600" },
  { href: "/shop/delivery", label: "Delivery zones", icon: Truck, chip: "bg-green-100 text-green-700" },
];

export default async function AdminOverviewPage() {
  const d = await getData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">
          {greeting()}
          {d.firstName ? `, ${d.firstName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Commerce overview ·{" "}
          <span className="align-middle text-base font-extrabold uppercase tracking-wide text-primary">Protein Pack</span>
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Wallet} chip="bg-green-100 text-green-700" label="Revenue (delivered)" value={naira(d.revenue)} />
        <StatCard icon={ShoppingCart} chip="bg-primary/10 text-primary" label="Orders" value={d.ordersTotal} />
        <StatCard icon={Users} chip="bg-sky-100 text-sky-600" label="Customers" value={d.customers} />
        <StatCard icon={Package} chip="bg-gold/20 text-gold-foreground" label="Products" value={d.products} />
      </section>

      {/* Needs attention */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Needs attention</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Attention icon={Clock} label="Pending orders" count={d.pendingOrders} href="/shop/orders" />
          <Attention icon={Star} label="Reviews to moderate" count={d.pendingReviews} href="/shop/reviews" />
          <Attention icon={BellRing} label="Role requests" count={d.roleRequests} href="/shop/customers" />
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-primary/5"
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${a.chip}`}>
                <a.icon size={18} />
              </span>
              <span className="flex-1 text-sm font-semibold">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent orders */}
      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold">Recent orders</h2>
          <Link href="/shop/orders" className="text-xs font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        {d.recentOrders.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No orders yet — they’ll show here as the storefront goes live.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {d.recentOrders.map((o) => (
              <li key={o.ref} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{o.customer}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {o.ref} · {o.dateLabel}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold">{naira(o.total)}</span>
                <span className={"shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold " + (STATUS_STYLE[o.status] ?? "")}>
                  {STATUS_LABEL[o.status] ?? o.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
