"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2, ChevronLeft, ChevronRight, Phone, Mail, Check } from "lucide-react";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  approveRequest,
  declineRequest,
  type CustomerState,
} from "./actions";

export type CustomerKind = "RETAIL" | "DISTRIBUTOR" | "AGENT";
export type Customer = {
  id: string;
  name: string;
  type: CustomerKind;
  requestedType: CustomerKind | null;
  phone: string;
  email: string;
  address: string;
  joinedLabel: string;
  orders: number;
  spent: number;
};

const TYPES: CustomerKind[] = ["RETAIL", "DISTRIBUTOR", "AGENT"];
const TYPE_LABEL: Record<CustomerKind, string> = {
  RETAIL: "Retail",
  DISTRIBUTOR: "Distributor",
  AGENT: "Agent",
};
const TYPE_STYLE: Record<CustomerKind, string> = {
  RETAIL: "bg-sky-100 text-sky-600",
  DISTRIBUTOR: "bg-primary/10 text-primary",
  AGENT: "bg-gold/20 text-gold-foreground",
};

const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
const initialOf = (s: string) => (s.charAt(0) || "?").toUpperCase();

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";
const submitClass =
  "w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-muted-foreground hover:bg-accent">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CustomerForm({ initial, onDone }: { initial?: Customer; onDone: () => void }) {
  const router = useRouter();
  const isEdit = !!initial;
  const [state, action, pending] = useActionState<CustomerState, FormData>(
    isEdit ? updateCustomer : createCustomer,
    {}
  );
  useEffect(() => {
    if (state.success) {
      router.refresh();
      onDone();
    }
  }, [state.success, onDone, router]);

  return (
    <form action={action} className="space-y-3">
      {isEdit && <input type="hidden" name="id" value={initial!.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Name</span>
          <input name="name" required defaultValue={initial?.name} placeholder="Customer name" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Type</span>
          <select name="type" defaultValue={initial?.type ?? "RETAIL"} className={inputClass}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Phone</span>
          <input name="phone" defaultValue={initial?.phone} placeholder="080…" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Email</span>
          <input type="email" name="email" defaultValue={initial?.email} placeholder="name@email.com" className={inputClass} />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Address</span>
          <textarea name="address" rows={2} defaultValue={initial?.address} className={inputClass} />
        </label>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">{state.success}</p>}
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Add customer"}
      </button>
    </form>
  );
}

export default function CustomersList({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [filter, setFilter] = useState<"ALL" | CustomerKind>("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = customers.filter((c) => filter === "ALL" || c.type === filter);

  const pageSize = 8;
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [filter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  async function handleDelete(c: Customer) {
    if (!confirm(`Delete ${c.name}?`)) return;
    setBusyId(c.id);
    const res = await deleteCustomer(c.id);
    setBusyId(null);
    if (!res.ok) {
      alert(res.error ?? "Could not delete.");
      return;
    }
    router.refresh();
  }

  async function handleApprove(c: Customer) {
    setBusyId(c.id);
    const res = await approveRequest(c.id);
    setBusyId(null);
    if (!res.ok) {
      alert(res.error ?? "Could not approve.");
      return;
    }
    router.refresh();
  }

  async function handleDecline(c: Customer) {
    if (!confirm(`Decline ${c.name}'s upgrade request?`)) return;
    setBusyId(c.id);
    await declineRequest(c.id);
    setBusyId(null);
    router.refresh();
  }

  const RequestControls = ({ c }: { c: Customer }) =>
    c.requestedType ? (
      <div className="mt-1.5 flex items-center gap-1">
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
          Wants {TYPE_LABEL[c.requestedType]}
        </span>
        <button
          onClick={() => handleApprove(c)}
          disabled={busyId === c.id}
          title="Approve"
          className="rounded p-1 text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
        >
          <Check size={13} />
        </button>
        <button
          onClick={() => handleDecline(c)}
          disabled={busyId === c.id}
          title="Decline"
          className="rounded p-1 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          <X size={13} />
        </button>
      </div>
    ) : null;

  const FILTERS: { value: "ALL" | CustomerKind; label: string }[] = [
    { value: "ALL", label: "All" },
    ...TYPES.map((t) => ({ value: t, label: TYPE_LABEL[t] })),
  ];

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h2 className="px-1 text-sm font-semibold sm:px-0">Customers</h2>
        <div className="flex items-center gap-2">
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
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add customer</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium">{customers.length === 0 ? "No customers yet" : "No customers of this type"}</p>
          {customers.length === 0 && <p className="mt-1 text-sm text-muted-foreground">Tap “Add customer” to create one.</p>}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Type</th>
                  <th className="px-5 py-2.5 font-medium">Contact</th>
                  <th className="px-5 py-2.5 font-medium">Orders</th>
                  <th className="px-5 py-2.5 font-medium">Spent</th>
                  <th className="px-5 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                          {initialOf(c.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{c.name}</p>
                          <p className="truncate text-xs text-muted-foreground">Joined {c.joinedLabel}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={"rounded-md px-2 py-0.5 text-[11px] font-semibold " + TYPE_STYLE[c.type]}>
                        {TYPE_LABEL[c.type]}
                      </span>
                      <RequestControls c={c} />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <p className="truncate">{c.phone || "—"}</p>
                      {c.email && <p className="truncate text-xs">{c.email}</p>}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{c.orders}</td>
                    <td className="px-5 py-3 font-semibold">{naira(c.spent)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(c)} aria-label="Edit" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(c)} disabled={busyId === c.id} aria-label="Delete" className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
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
            {paginated.map((c) => (
              <li key={c.id} className="flex items-start gap-3 px-2 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                  {initialOf(c.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{c.name}</p>
                    <span className={"shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold " + TYPE_STYLE[c.type]}>
                      {TYPE_LABEL[c.type]}
                    </span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                    {c.phone ? (
                      <>
                        <Phone size={11} /> {c.phone}
                      </>
                    ) : c.email ? (
                      <>
                        <Mail size={11} /> {c.email}
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.orders} order{c.orders !== 1 ? "s" : ""} · {naira(c.spent)}
                  </p>
                  <RequestControls c={c} />
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => setEditing(c)} aria-label="Edit" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(c)} disabled={busyId === c.id} aria-label="Delete" className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                    <Trash2 size={16} />
                  </button>
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

      {adding && (
        <Modal title="Add customer" onClose={() => setAdding(false)}>
          <CustomerForm onDone={() => setAdding(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title={`Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <CustomerForm initial={editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
    </section>
  );
}
