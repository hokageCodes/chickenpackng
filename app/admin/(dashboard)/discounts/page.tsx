import { Ticket, CheckCircle2, Repeat, CalendarX, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import DiscountsList, { type Discount } from "./DiscountsList";

export const dynamic = "force-dynamic";

const isoDate = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");

async function getData() {
  const rows = await prisma.discount.findMany({ orderBy: { createdAt: "desc" } });
  const now = new Date();

  const discounts: Discount[] = rows.map((d) => ({
    id: d.id,
    code: d.code,
    description: d.description ?? "",
    type: d.type,
    value: Number(d.value),
    minOrder: Number(d.minOrderNGN),
    maxUses: d.maxUses,
    usedCount: d.usedCount,
    startsAt: isoDate(d.startsAt),
    expiresAt: isoDate(d.expiresAt),
    active: d.active,
  }));

  const activeCount = rows.filter(
    (d) => d.active && (!d.expiresAt || d.expiresAt >= now) && (d.maxUses == null || d.usedCount < d.maxUses)
  ).length;
  const redemptions = rows.reduce((a, d) => a + d.usedCount, 0);
  const expired = rows.filter((d) => d.expiresAt && d.expiresAt < now).length;

  return { discounts, activeCount, redemptions, expired };
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

export default async function DiscountsPage() {
  const d = await getData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Discounts</h1>
        <p className="text-sm text-muted-foreground">Coupon codes for the Protein Pack storefront</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Ticket} chip="bg-primary/10 text-primary" label="Discounts" value={d.discounts.length} />
        <StatCard icon={CheckCircle2} chip="bg-green-100 text-green-700" label="Active" value={d.activeCount} />
        <StatCard icon={Repeat} chip="bg-sky-100 text-sky-600" label="Redemptions" value={d.redemptions} />
        <StatCard icon={CalendarX} chip="bg-amber-100 text-amber-700" label="Expired" value={d.expired} />
      </section>

      <DiscountsList discounts={d.discounts} />
    </div>
  );
}
