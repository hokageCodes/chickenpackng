import { ShoppingCart, Clock, CheckCircle2, Wallet, type LucideIcon } from "lucide-react";
import OrdersList, { type Order } from "./OrdersList";

export const dynamic = "force-dynamic";

const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
const total = (o: Order) => o.items.reduce((a, i) => a + i.qty * i.price, 0);

// TODO: replace with real data once Order/Customer models exist (Phase 5 — storefront).
const SAMPLE_ORDERS: Order[] = [
  {
    id: "ORD-1042",
    customer: "Ifeoma Nwosu",
    type: "Retail",
    status: "Pending",
    dateLabel: "21 Jun",
    items: [
      { name: "Full Chicken (2kg)", qty: 2, price: 3500 },
      { name: "Crate of Eggs", qty: 1, price: 4200 },
    ],
  },
  {
    id: "ORD-1041",
    customer: "Kemi Foods Ltd.",
    type: "Distributor",
    status: "Processing",
    dateLabel: "21 Jun",
    items: [
      { name: "Full Chicken (5kg)", qty: 6, price: 8000 },
      { name: "Chicken Laps (2kg)", qty: 4, price: 4500 },
    ],
  },
  {
    id: "ORD-1040",
    customer: "Abuja Bistro",
    type: "Agent",
    status: "Out for delivery",
    dateLabel: "20 Jun",
    items: [
      { name: "Smoked Catfish (1kg)", qty: 5, price: 6000 },
      { name: "Fresh Catfish (5kg)", qty: 2, price: 11000 },
    ],
  },
  {
    id: "ORD-1039",
    customer: "Tunde Bakare",
    type: "Retail",
    status: "Delivered",
    dateLabel: "20 Jun",
    items: [{ name: "Chicken Wings (1kg)", qty: 3, price: 2500 }],
  },
  {
    id: "ORD-1038",
    customer: "Mama Nkechi Kitchen",
    type: "Agent",
    status: "Delivered",
    dateLabel: "19 Jun",
    items: [
      { name: "Full Chicken (2kg)", qty: 10, price: 3500 },
      { name: "Crate of Eggs", qty: 4, price: 4200 },
    ],
  },
  {
    id: "ORD-1037",
    customer: "Lagos Grill House",
    type: "Distributor",
    status: "Delivered",
    dateLabel: "19 Jun",
    items: [{ name: "Chicken Breast (5kg)", qty: 8, price: 11700 }],
  },
  {
    id: "ORD-1036",
    customer: "Chidi Okeke",
    type: "Retail",
    status: "Cancelled",
    dateLabel: "18 Jun",
    items: [{ name: "Smoked Catfish (1kg)", qty: 2, price: 6000 }],
  },
  {
    id: "ORD-1035",
    customer: "Greenfield Stores",
    type: "Distributor",
    status: "Delivered",
    dateLabel: "18 Jun",
    items: [
      { name: "Full Chicken (5kg)", qty: 12, price: 8000 },
      { name: "Chicken Laps (5kg)", qty: 5, price: 11000 },
    ],
  },
];

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

export default function OrdersPage() {
  const orders = SAMPLE_ORDERS;
  const pending = orders.filter((o) => o.status === "Pending").length;
  const delivered = orders.filter((o) => o.status === "Delivered");
  const revenue = delivered.reduce((a, o) => a + total(o), 0);

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">Orders</h1>
          <span className="rounded-md bg-gold/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-foreground">
            Sample data
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Customer orders across retail, distributors and agents</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={ShoppingCart} chip="bg-primary/10 text-primary" label="Total orders" value={orders.length} />
        <StatCard icon={Clock} chip="bg-amber-100 text-amber-700" label="Pending" value={pending} />
        <StatCard icon={CheckCircle2} chip="bg-green-100 text-green-700" label="Delivered" value={delivered.length} />
        <StatCard icon={Wallet} chip="bg-sky-100 text-sky-600" label="Revenue" value={naira(revenue)} />
      </section>

      <OrdersList orders={orders} />
    </div>
  );
}
