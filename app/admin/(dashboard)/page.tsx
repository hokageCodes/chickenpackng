import {
  ShoppingCart,
  Package,
  Users,
  Wallet,
  Hammer,
  type LucideIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

const PLACEHOLDER_STATS: { icon: LucideIcon; chip: string; label: string }[] = [
  { icon: ShoppingCart, chip: "bg-primary/10 text-primary", label: "Orders today" },
  { icon: Wallet, chip: "bg-green-100 text-green-700", label: "Revenue (month)" },
  { icon: Users, chip: "bg-sky-100 text-sky-600", label: "Customers" },
  { icon: Package, chip: "bg-gold/20 text-gold-foreground", label: "Products" },
];

const MODULES = [
  "Orders",
  "Products",
  "Customers",
  "Payments",
  "Delivery",
  "Discounts",
  "Reviews",
  "Reports",
  "Settings",
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Commerce overview</h1>
        <p className="text-sm text-muted-foreground">
          Protein Pack storefront — orders, products and customers
        </p>
      </header>

      {/* Placeholder stats */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {PLACEHOLDER_STATS.map((s) => (
          <div key={s.label} className="flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-3xl font-extrabold leading-none tracking-tight text-muted-foreground/40 sm:text-4xl">
                  —
                </p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                  {s.label}
                </p>
              </div>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-12 sm:w-12 ${s.chip}`}>
                <s.icon size={22} strokeWidth={2} />
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Scaffold notice */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/20 text-gold-foreground">
            <Hammer size={20} />
          </span>
          <div>
            <h2 className="text-sm font-bold">Commerce Admin is being scaffolded</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The shell is ready. These modules come next once the storefront data models
              (orders, products, customers) are added to the schema:
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {MODULES.map((m) => (
                <li
                  key={m}
                  className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  {m}
                  <span className="rounded bg-card px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                    soon
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
