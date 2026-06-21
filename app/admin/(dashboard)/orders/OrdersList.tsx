"use client";

import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, User } from "lucide-react";

export type OrderItem = { name: string; qty: number; price: number };
export type Order = {
  id: string;
  customer: string;
  type: "Retail" | "Distributor" | "Agent";
  status: "Pending" | "Processing" | "Out for delivery" | "Delivered" | "Cancelled";
  dateLabel: string;
  items: OrderItem[];
};

const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
const orderTotal = (o: Order) => o.items.reduce((a, i) => a + i.qty * i.price, 0);
const itemCount = (o: Order) => o.items.reduce((a, i) => a + i.qty, 0);

const STATUS_STYLE: Record<Order["status"], string> = {
  Pending: "bg-amber-100 text-amber-700",
  Processing: "bg-sky-100 text-sky-600",
  "Out for delivery": "bg-primary/10 text-primary",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
};

const FILTERS = ["All", "Pending", "Processing", "Out for delivery", "Delivered", "Cancelled"] as const;

export default function OrdersList({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = orders.filter((o) => filter === "All" || o.status === filter);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h2 className="px-1 text-sm font-semibold sm:px-0">Orders</h2>
        {/* Filter: dropdown on mobile, chips on desktop */}
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as typeof filter);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:hidden"
        >
          {FILTERS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <div className="hidden flex-wrap gap-1.5 sm:flex">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors " +
                (filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent")
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">No orders match this filter.</p>
      ) : (
        <ul className="divide-y divide-border">
          {paginated.map((o) => {
            const open = expanded === o.id;
            return (
              <li key={o.id}>
                <button
                  onClick={() => setExpanded(open ? null : o.id)}
                  className="flex w-full items-center gap-3 px-2 py-3 text-left transition-colors hover:bg-muted/40 sm:px-5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                    <User size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{o.customer}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">· {o.type}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {o.id} · {itemCount(o)} item{itemCount(o) !== 1 ? "s" : ""} · {o.dateLabel}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-bold">{naira(orderTotal(o))}</span>
                    <span className={"rounded-md px-1.5 py-0.5 text-[10px] font-semibold " + STATUS_STYLE[o.status]}>
                      {o.status}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={"shrink-0 text-muted-foreground transition-transform " + (open ? "rotate-180" : "")}
                  />
                </button>

                {open && (
                  <div className="bg-muted/30 px-2 pb-3 sm:px-5">
                    <div className="overflow-hidden rounded-lg border border-border bg-card">
                      {o.items.map((it, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-3 border-b border-border px-3 py-2 text-sm last:border-0"
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {it.name} <span className="text-muted-foreground">× {it.qty}</span>
                          </span>
                          <span className="shrink-0 font-medium">{naira(it.qty * it.price)}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm font-bold">
                        <span>Total</span>
                        <span>{naira(orderTotal(o))}</span>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
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
