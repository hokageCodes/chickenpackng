"use client";

import { useState } from "react";
import { Eye, Trash2, X, ChevronLeft, ChevronRight, Package } from "lucide-react";

export type OrderItem = { name: string; qty: number; price: number };
export type Order = {
  id: string;
  customer: string;
  type: "Retail" | "Distributor" | "Agent";
  status: OrderStatus;
  dateLabel: string;
  items: OrderItem[];
};
export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Out for delivery"
  | "Delivered"
  | "Cancelled";

const STATUSES: OrderStatus[] = ["Pending", "Processing", "Out for delivery", "Delivered", "Cancelled"];
const FILTERS = ["All", ...STATUSES] as const;

const STATUS_STYLE: Record<OrderStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Processing: "bg-sky-100 text-sky-600",
  "Out for delivery": "bg-primary/10 text-primary",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
};

const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
const orderTotal = (o: Order) => o.items.reduce((a, i) => a + i.qty * i.price, 0);
const itemCount = (o: Order) => o.items.reduce((a, i) => a + i.qty, 0);
const initialOf = (s: string) => s.charAt(0).toUpperCase();

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={"inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold " + STATUS_STYLE[status]}>
      {status}
    </span>
  );
}

function StatusSelect({
  value,
  onChange,
}: {
  value: OrderStatus;
  onChange: (s: OrderStatus) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as OrderStatus)}
      onClick={(e) => e.stopPropagation()}
      className={
        "cursor-pointer rounded-md border-0 px-2 py-1 text-xs font-semibold outline-none ring-1 ring-inset ring-transparent focus:ring-primary " +
        STATUS_STYLE[value]
      }
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="bg-card text-foreground">
          {s}
        </option>
      ))}
    </select>
  );
}

export default function OrdersList({ orders: initial }: { orders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initial);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = orders.filter((o) => filter === "All" || o.status === filter);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  const viewing = orders.find((o) => o.id === viewingId) ?? null;

  function setStatus(id: string, status: OrderStatus) {
    // Sample data: update locally. Real impl would call a server action then refresh.
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }
  function remove(id: string) {
    if (!confirm("Delete this order?")) return;
    setOrders((prev) => prev.filter((o) => o.id !== id));
    if (viewingId === id) setViewingId(null);
  }

  return (
    <section className="rounded-2xl border border-border bg-card">
      {/* Header + filter */}
      <div className="flex flex-col gap-3 border-b border-border px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h2 className="px-1 text-sm font-semibold sm:px-0">Orders</h2>
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
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-5 py-2.5 font-medium">Order</th>
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Items</th>
                  <th className="px-5 py-2.5 font-medium">Total</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Date</th>
                  <th className="px-5 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((o) => (
                  <tr key={o.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3 font-semibold">{o.id}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                          {initialOf(o.customer)}
                        </span>
                        <div className="leading-tight">
                          <p className="font-medium">{o.customer}</p>
                          <p className="text-xs text-muted-foreground">{o.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{itemCount(o)}</td>
                    <td className="px-5 py-3 font-semibold">{naira(orderTotal(o))}</td>
                    <td className="px-5 py-3">
                      <StatusSelect value={o.status} onChange={(s) => setStatus(o.id, s)} />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{o.dateLabel}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingId(o.id)}
                          aria-label="View order"
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => remove(o.id)}
                          aria-label="Delete order"
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-border md:hidden">
            {paginated.map((o) => (
              <li key={o.id} className="px-2 py-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                    {initialOf(o.customer)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{o.customer}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {o.id} · {o.type} · {o.dateLabel}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <StatusBadge status={o.status} />
                      <span className="text-xs text-muted-foreground">{itemCount(o)} items</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-sm font-bold">{naira(orderTotal(o))}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingId(o.id)}
                        aria-label="View order"
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => remove(o.id)}
                        aria-label="Delete order"
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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

      {/* View side-drawer */}
      {viewing && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50"
          onClick={() => setViewingId(null)}
        >
          <div
            className="flex h-full w-full max-w-md flex-col bg-card shadow-xl duration-200 animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-base font-bold">{viewing.id}</p>
                <p className="text-xs text-muted-foreground">{viewing.dateLabel}</p>
              </div>
              <button
                onClick={() => setViewingId(null)}
                aria-label="Close"
                className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {/* Customer */}
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-muted text-base font-semibold text-muted-foreground">
                  {initialOf(viewing.customer)}
                </span>
                <div>
                  <p className="font-semibold">{viewing.customer}</p>
                  <p className="text-xs text-muted-foreground">{viewing.type} customer</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Status</p>
                <StatusSelect value={viewing.status} onChange={(s) => setStatus(viewing.id, s)} />
              </div>

              {/* Items */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Package size={13} /> Items
                </p>
                <div className="overflow-hidden rounded-lg border border-border">
                  {viewing.items.map((it, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5 text-sm last:border-0"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="font-medium">{it.name}</span>
                        <span className="text-muted-foreground"> × {it.qty}</span>
                        <span className="block text-xs text-muted-foreground">{naira(it.price)} each</span>
                      </span>
                      <span className="shrink-0 font-semibold">{naira(it.qty * it.price)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-3 bg-muted/40 px-3 py-2.5 text-sm font-bold">
                    <span>Total</span>
                    <span>{naira(orderTotal(viewing))}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border p-4">
              <button
                onClick={() => remove(viewing.id)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                <Trash2 size={16} /> Delete order
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
