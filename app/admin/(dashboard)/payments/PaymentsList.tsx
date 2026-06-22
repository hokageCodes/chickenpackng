"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CreditCard } from "lucide-react";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "ABANDONED";
export type Payment = {
  id: string;
  reference: string;
  customer: string;
  amount: number;
  status: PaymentStatus;
  channel: string;
  dateLabel: string;
  orderRef: string;
};

const STATUSES: PaymentStatus[] = ["PENDING", "SUCCESS", "FAILED", "REFUNDED", "ABANDONED"];
const LABEL: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  SUCCESS: "Success",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  ABANDONED: "Abandoned",
};
const STYLE: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  SUCCESS: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-600",
  REFUNDED: "bg-sky-100 text-sky-600",
  ABANDONED: "bg-muted text-muted-foreground",
};

const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

export default function PaymentsList({ payments }: { payments: Payment[] }) {
  const [filter, setFilter] = useState<"ALL" | PaymentStatus>("ALL");
  const filtered = payments.filter((p) => filter === "ALL" || p.status === filter);

  const pageSize = 8;
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [filter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  const FILTERS: { value: "ALL" | PaymentStatus; label: string }[] = [
    { value: "ALL", label: "All" },
    ...STATUSES.map((s) => ({ value: s, label: LABEL[s] })),
  ];

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h2 className="px-1 text-sm font-semibold sm:px-0">Transactions</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center px-5 py-12 text-center">
          <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-muted text-muted-foreground">
            <CreditCard size={20} />
          </span>
          <p className="text-sm font-medium">No payments yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Once checkout is live, Paystack transactions will be recorded here automatically.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">No payments match this filter.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-5 py-2.5 font-medium">Reference</th>
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Amount</th>
                  <th className="px-5 py-2.5 font-medium">Channel</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3 font-mono text-xs">{p.reference}</td>
                    <td className="px-5 py-3">{p.customer || "—"}</td>
                    <td className="px-5 py-3 font-semibold">{naira(p.amount)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.channel || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={"rounded-md px-2 py-0.5 text-[11px] font-semibold " + STYLE[p.status]}>
                        {LABEL[p.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{p.dateLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-border md:hidden">
            {paginated.map((p) => (
              <li key={p.id} className="px-2 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.customer || p.reference}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">{p.reference}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.channel || "—"} · {p.dateLabel}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-bold">{naira(p.amount)}</span>
                    <span className={"rounded-md px-1.5 py-0.5 text-[10px] font-semibold " + STYLE[p.status]}>
                      {LABEL[p.status]}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {filtered.length > pageSize && (
        <div className="flex items-center justify-between gap-2 border-t border-border px-2 py-3 sm:px-5">
          <p className="text-xs text-muted-foreground">
            {start + 1}–{Math.min(start + pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current <= 1}
              aria-label="Previous page"
              className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-1 text-xs font-medium tabular-nums">
              {current} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={current >= totalPages}
              aria-label="Next page"
              className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
