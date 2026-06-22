import { Users, Truck, UserCog, BellRing, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import CustomersList, { type Customer } from "./CustomersList";

export const dynamic = "force-dynamic";

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));

async function getData() {
  const [rows, spend] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
    }),
    prisma.order.groupBy({ by: ["customerId"], _sum: { totalNGN: true } }),
  ]);

  const spendMap = new Map(spend.map((s) => [s.customerId, Number(s._sum.totalNGN ?? 0)]));

  const customers: Customer[] = rows.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    requestedType: c.requestedType ?? null,
    phone: c.phone ?? "",
    email: c.email ?? "",
    address: c.address ?? "",
    joinedLabel: fmtDate(c.createdAt),
    orders: c._count.orders,
    spent: spendMap.get(c.id) ?? 0,
  }));

  return {
    customers,
    distributors: customers.filter((c) => c.type === "DISTRIBUTOR").length,
    agents: customers.filter((c) => c.type === "AGENT").length,
    pending: customers.filter((c) => c.requestedType).length,
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
          <p className="text-2xl font-extrabold leading-none tracking-tight sm:text-3xl">{value}</p>
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

export default async function CustomersPage() {
  const d = await getData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground">Retail buyers, distributors and agents</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Users} chip="bg-primary/10 text-primary" label="Total" value={d.customers.length} />
        <StatCard icon={Truck} chip="bg-sky-100 text-sky-600" label="Distributors" value={d.distributors} />
        <StatCard icon={UserCog} chip="bg-gold/20 text-gold-foreground" label="Agents" value={d.agents} />
        <StatCard icon={BellRing} chip="bg-amber-100 text-amber-700" label="Pending requests" value={d.pending} />
      </section>

      <CustomersList customers={d.customers} />
    </div>
  );
}
