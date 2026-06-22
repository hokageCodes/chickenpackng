import { Wallet, Clock, XCircle, RotateCcw, CheckCircle2, AlertTriangle, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import PaymentsList, { type Payment } from "./PaymentsList";

export const dynamic = "force-dynamic";

const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "2-digit",
    month: "short",
  }).format(new Date(d));

// Safe, server-side check — never exposes the key.
function paystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY && process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY);
}

async function getData() {
  const rows = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: true },
  });

  const payments: Payment[] = rows.map((p) => ({
    id: p.id,
    reference: p.reference,
    customer: p.customerName ?? p.email ?? "",
    amount: Number(p.amountNGN),
    status: p.status,
    channel: p.channel ?? "",
    dateLabel: fmtDate(p.paidAt ?? p.createdAt),
    orderRef: p.order ? `ORD-${p.order.number}` : "",
  }));

  const received = rows.filter((p) => p.status === "SUCCESS").reduce((a, p) => a + Number(p.amountNGN), 0);
  const pending = payments.filter((p) => p.status === "PENDING").length;
  const failed = payments.filter((p) => p.status === "FAILED").length;

  return { payments, received, pending, failed };
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

export default async function PaymentsPage() {
  const d = await getData();
  const connected = paystackConfigured();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-sm text-muted-foreground">Paystack transactions for Protein Pack orders</p>
      </header>

      {/* Paystack connection status */}
      {connected ? (
        <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-green-600" />
          <div className="text-sm">
            <p className="font-semibold text-green-800">Paystack connected</p>
            <p className="text-green-700">Live transactions will be recorded here automatically.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800">Paystack not connected</p>
            <p className="text-amber-700">
              Add{" "}
              <code className="rounded bg-amber-100 px-1 font-mono text-xs">PAYSTACK_SECRET_KEY</code> and{" "}
              <code className="rounded bg-amber-100 px-1 font-mono text-xs">NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY</code>{" "}
              to your environment to start accepting payments. The page stays read-only until then.
            </p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Wallet} chip="bg-green-100 text-green-700" label="Received" value={naira(d.received)} />
        <StatCard icon={Clock} chip="bg-amber-100 text-amber-700" label="Pending" value={d.pending} />
        <StatCard icon={XCircle} chip="bg-red-100 text-red-600" label="Failed" value={d.failed} />
        <StatCard icon={RotateCcw} chip="bg-sky-100 text-sky-600" label="Transactions" value={d.payments.length} />
      </section>

      <PaymentsList payments={d.payments} />
    </div>
  );
}
