"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2, ChevronLeft, ChevronRight, Ticket } from "lucide-react";
import { createDiscount, updateDiscount, deleteDiscount, toggleDiscount, type DiscountState } from "./actions";

export type DiscountKind = "PERCENT" | "FIXED";
export type Discount = {
  id: string;
  code: string;
  description: string;
  type: DiscountKind;
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: string; // yyyy-mm-dd or ""
  expiresAt: string;
  active: boolean;
};

type Status = "ACTIVE" | "INACTIVE" | "EXPIRED" | "USED_UP";

const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
const fmtDate = (s: string) =>
  s ? new Intl.DateTimeFormat("en-NG", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(s)) : "";

function statusOf(d: Discount): Status {
  if (!d.active) return "INACTIVE";
  if (d.expiresAt && new Date(d.expiresAt) < new Date()) return "EXPIRED";
  if (d.maxUses != null && d.usedCount >= d.maxUses) return "USED_UP";
  return "ACTIVE";
}
const STATUS_LABEL: Record<Status, string> = { ACTIVE: "Active", INACTIVE: "Inactive", EXPIRED: "Expired", USED_UP: "Used up" };
const STATUS_STYLE: Record<Status, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-muted text-muted-foreground",
  EXPIRED: "bg-amber-100 text-amber-700",
  USED_UP: "bg-sky-100 text-sky-600",
};

const valueText = (d: Discount) => (d.type === "PERCENT" ? `${d.value}% off` : `${naira(d.value)} off`);

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
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
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

function DiscountForm({ initial, onDone }: { initial?: Discount; onDone: () => void }) {
  const router = useRouter();
  const isEdit = !!initial;
  const [state, action, pending] = useActionState<DiscountState, FormData>(isEdit ? updateDiscount : createDiscount, {});
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
          <span className={labelClass}>Code</span>
          <input name="code" required defaultValue={initial?.code} placeholder="WELCOME10" className={inputClass + " uppercase"} />
        </label>
        <label className="block">
          <span className={labelClass}>Type</span>
          <select name="type" defaultValue={initial?.type ?? "PERCENT"} className={inputClass}>
            <option value="PERCENT">Percentage (%)</option>
            <option value="FIXED">Fixed amount (₦)</option>
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Value</span>
          <input type="number" name="value" min={0} step="0.01" required defaultValue={initial?.value} placeholder="10" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Min order (₦)</span>
          <input type="number" name="minOrder" min={0} defaultValue={initial?.minOrder ?? 0} placeholder="5000" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Max uses (blank = ∞)</span>
          <input type="number" name="maxUses" min={1} defaultValue={initial?.maxUses ?? ""} placeholder="100" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Expires (optional)</span>
          <input type="date" name="expiresAt" defaultValue={initial?.expiresAt} className={inputClass} />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Description (optional)</span>
          <input name="description" defaultValue={initial?.description} placeholder="New customer offer" className={inputClass} />
        </label>
        <input type="hidden" name="startsAt" value={initial?.startsAt ?? ""} />
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="active" defaultChecked={initial ? initial.active : true} className="h-4 w-4 rounded border-border" />
          Active
        </label>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">{state.success}</p>}
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Create discount"}
      </button>
    </form>
  );
}

export default function DiscountsList({ discounts }: { discounts: Discount[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [filter, setFilter] = useState<"ALL" | Status>("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = discounts.filter((d) => filter === "ALL" || statusOf(d) === filter);

  const pageSize = 8;
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [filter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  async function handleDelete(d: Discount) {
    if (!confirm(`Delete ${d.code}?`)) return;
    setBusyId(d.id);
    const res = await deleteDiscount(d.id);
    setBusyId(null);
    if (!res.ok) {
      alert(res.error ?? "Could not delete.");
      return;
    }
    router.refresh();
  }

  async function handleToggle(d: Discount) {
    setBusyId(d.id);
    await toggleDiscount(d.id, !d.active);
    setBusyId(null);
    router.refresh();
  }

  const StatusBadge = ({ d }: { d: Discount }) => {
    const s = statusOf(d);
    const toggleable = s === "ACTIVE" || s === "INACTIVE";
    const cls = "rounded-md px-2 py-0.5 text-[11px] font-semibold " + STATUS_STYLE[s];
    if (!toggleable) return <span className={cls}>{STATUS_LABEL[s]}</span>;
    return (
      <button onClick={() => handleToggle(d)} disabled={busyId === d.id} title="Toggle active" className={cls + " transition-colors hover:opacity-80 disabled:opacity-50"}>
        {STATUS_LABEL[s]}
      </button>
    );
  };

  const usesText = (d: Discount) => `${d.usedCount}${d.maxUses != null ? ` / ${d.maxUses}` : ""}`;

  const FILTERS: { value: "ALL" | Status; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "EXPIRED", label: "Expired" },
    { value: "USED_UP", label: "Used up" },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h2 className="px-1 text-sm font-semibold sm:px-0">Discounts</h2>
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
            <span className="hidden sm:inline">Add discount</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium">{discounts.length === 0 ? "No discounts yet" : "No discounts match this filter"}</p>
          {discounts.length === 0 && <p className="mt-1 text-sm text-muted-foreground">Tap “Add discount” to create a coupon.</p>}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-5 py-2.5 font-medium">Code</th>
                  <th className="px-5 py-2.5 font-medium">Discount</th>
                  <th className="px-5 py-2.5 font-medium">Min order</th>
                  <th className="px-5 py-2.5 font-medium">Uses</th>
                  <th className="px-5 py-2.5 font-medium">Expires</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((d) => (
                  <tr key={d.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Ticket size={15} className="shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="font-mono font-semibold">{d.code}</p>
                          {d.description && <p className="truncate text-xs text-muted-foreground">{d.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold">{valueText(d)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{d.minOrder > 0 ? naira(d.minOrder) : "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{usesText(d)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{d.expiresAt ? fmtDate(d.expiresAt) : "—"}</td>
                    <td className="px-5 py-3">
                      <StatusBadge d={d} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(d)} aria-label="Edit" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(d)} disabled={busyId === d.id} aria-label="Delete" className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
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
            {paginated.map((d) => (
              <li key={d.id} className="px-2 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold">{d.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {valueText(d)}
                      {d.minOrder > 0 ? ` · min ${naira(d.minOrder)}` : ""} · {usesText(d)} used
                    </p>
                    <div className="mt-1.5">
                      <StatusBadge d={d} />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => setEditing(d)} aria-label="Edit" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(d)} disabled={busyId === d.id} aria-label="Delete" className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                      <Trash2 size={16} />
                    </button>
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
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={current <= 1} aria-label="Previous page" className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <span className="px-1 text-xs font-medium tabular-nums">{current} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={current >= totalPages} aria-label="Next page" className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {adding && (
        <Modal title="Add discount" onClose={() => setAdding(false)}>
          <DiscountForm onDone={() => setAdding(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title={`Edit ${editing.code}`} onClose={() => setEditing(null)}>
          <DiscountForm initial={editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
    </section>
  );
}
