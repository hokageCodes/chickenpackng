import { Star, CheckCircle2, Clock, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import ReviewsList, { type Review, type ProductOption } from "./ReviewsList";

export const dynamic = "force-dynamic";

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));

async function getData() {
  const [rows, products] = await Promise.all([
    prisma.review.findMany({ orderBy: { createdAt: "desc" }, include: { product: true } }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const reviews: Review[] = rows.map((r) => ({
    id: r.id,
    productId: r.productId ?? "",
    productName: r.product?.name ?? "",
    customerName: r.customerName,
    rating: r.rating,
    body: r.body ?? "",
    approved: r.approved,
    dateLabel: fmtDate(r.createdAt),
  }));

  const approved = reviews.filter((r) => r.approved).length;
  const pending = reviews.length - approved;
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  return { reviews, products: products as ProductOption[], approved, pending, avg };
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

export default async function ReviewsPage() {
  const d = await getData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground">Moderate customer reviews for the storefront</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Star} chip="bg-gold/20 text-gold-foreground" label="Total" value={d.reviews.length} />
        <StatCard icon={CheckCircle2} chip="bg-green-100 text-green-700" label="Approved" value={d.approved} />
        <StatCard icon={Clock} chip="bg-amber-100 text-amber-700" label="Pending" value={d.pending} />
        <StatCard icon={Star} chip="bg-primary/10 text-primary" label="Avg rating" value={d.avg ? d.avg.toFixed(1) : "—"} />
      </section>

      <ReviewsList reviews={d.reviews} products={d.products} />
    </div>
  );
}
