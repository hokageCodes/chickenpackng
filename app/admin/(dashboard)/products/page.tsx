import { Package, Eye, Tags, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import ProductsList, { type Product } from "./ProductsList";

export const dynamic = "force-dynamic";

async function getData() {
  const rows = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { category: true },
  });

  const products: Product[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category?.name ?? "",
    description: p.description ?? "",
    image: p.image ?? "",
    published: p.published,
    unit: p.unit,
    price: Number(p.pricePerUnitNGN),
    minQty: p.minQty,
    step: p.step,
  }));

  const published = products.filter((p) => p.published).length;
  const categories = new Set(products.map((p) => p.category).filter(Boolean)).size;

  return { products, published, categories };
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

export default async function ProductsPage() {
  const d = await getData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-muted-foreground">Catalog of what Protein Pack sells</p>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard icon={Package} chip="bg-primary/10 text-primary" label="Products" value={d.products.length} />
        <StatCard icon={Eye} chip="bg-green-100 text-green-700" label="Published" value={d.published} />
        <StatCard icon={Tags} chip="bg-gold/20 text-gold-foreground" label="Categories" value={d.categories} />
      </section>

      <ProductsList products={d.products} />
    </div>
  );
}
