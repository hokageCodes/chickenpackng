import { MapPin, CheckCircle2, Wallet, ShoppingBag, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import DeliveryList, { type Zone } from "./DeliveryList";

export const dynamic = "force-dynamic";

const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

async function getData() {
  const rows = await prisma.deliveryZone.findMany({ orderBy: { name: "asc" } });

  const zones: Zone[] = rows.map((z) => ({
    id: z.id,
    name: z.name,
    areas: z.areas ?? "",
    fee: Number(z.feeNGN),
    minOrder: Number(z.minOrderNGN),
    eta: z.eta ?? "",
    active: z.active,
  }));

  const active = zones.filter((z) => z.active);
  const avgFee = active.length ? Math.round(active.reduce((a, z) => a + z.fee, 0) / active.length) : 0;
  const avgMin = active.length ? Math.round(active.reduce((a, z) => a + z.minOrder, 0) / active.length) : 0;

  return { zones, activeCount: active.length, avgFee, avgMin };
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

export default async function DeliveryPage() {
  const d = await getData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Delivery</h1>
        <p className="text-sm text-muted-foreground">Zones, fees and minimum orders used at checkout</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={MapPin} chip="bg-primary/10 text-primary" label="Zones" value={d.zones.length} />
        <StatCard icon={CheckCircle2} chip="bg-green-100 text-green-700" label="Active" value={d.activeCount} />
        <StatCard icon={Wallet} chip="bg-sky-100 text-sky-600" label="Avg fee" value={naira(d.avgFee)} />
        <StatCard icon={ShoppingBag} chip="bg-gold/20 text-gold-foreground" label="Avg min order" value={naira(d.avgMin)} />
      </section>

      <DeliveryList zones={d.zones} />
    </div>
  );
}
