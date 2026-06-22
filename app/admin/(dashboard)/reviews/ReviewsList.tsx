"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2, ChevronLeft, ChevronRight, Star, Check } from "lucide-react";
import { createReview, updateReview, deleteReview, approveReview, type ReviewState } from "./actions";

export type ProductOption = { id: string; name: string };
export type Review = {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  body: string;
  approved: boolean;
  dateLabel: string;
};

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";
const submitClass =
  "w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60";

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= rating ? "fill-gold text-gold" : "text-muted-foreground/40"}
        />
      ))}
    </span>
  );
}

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

function ReviewForm({ initial, products, onDone }: { initial?: Review; products: ProductOption[]; onDone: () => void }) {
  const router = useRouter();
  const isEdit = !!initial;
  const [state, action, pending] = useActionState<ReviewState, FormData>(isEdit ? updateReview : createReview, {});
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
          <span className={labelClass}>Customer name</span>
          <input name="customerName" required defaultValue={initial?.customerName} placeholder="Customer name" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Rating</span>
          <select name="rating" defaultValue={String(initial?.rating ?? 5)} className={inputClass}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n !== 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Product (optional)</span>
          <select name="productId" defaultValue={initial?.productId ?? ""} className={inputClass}>
            <option value="">— general / store —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Review</span>
          <textarea name="body" rows={3} defaultValue={initial?.body} placeholder="What did they say?" className={inputClass} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="approved" defaultChecked={initial ? initial.approved : false} className="h-4 w-4 rounded border-border" />
        Approved (visible on storefront)
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">{state.success}</p>}
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Add review"}
      </button>
    </form>
  );
}

export default function ReviewsList({ reviews, products }: { reviews: Review[]; products: ProductOption[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [filter, setFilter] = useState<"ALL" | "APPROVED" | "PENDING">("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = reviews.filter((r) =>
    filter === "ALL" ? true : filter === "APPROVED" ? r.approved : !r.approved
  );

  const pageSize = 8;
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [filter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  async function handleDelete(r: Review) {
    if (!confirm("Delete this review?")) return;
    setBusyId(r.id);
    const res = await deleteReview(r.id);
    setBusyId(null);
    if (!res.ok) {
      alert(res.error ?? "Could not delete.");
      return;
    }
    router.refresh();
  }

  async function handleApprove(r: Review) {
    setBusyId(r.id);
    await approveReview(r.id, !r.approved);
    setBusyId(null);
    router.refresh();
  }

  const ApproveBadge = ({ r }: { r: Review }) => (
    <button
      onClick={() => handleApprove(r)}
      disabled={busyId === r.id}
      title="Toggle approval"
      className={
        "rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors disabled:opacity-50 " +
        (r.approved ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200")
      }
    >
      {r.approved ? "Approved" : "Pending"}
    </button>
  );

  const FILTERS = [
    { value: "ALL", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
  ] as const;

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h2 className="px-1 text-sm font-semibold sm:px-0">Reviews</h2>
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
            <span className="hidden sm:inline">Add review</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium">{reviews.length === 0 ? "No reviews yet" : "No reviews match this filter"}</p>
          {reviews.length === 0 && (
            <p className="mt-1 text-sm text-muted-foreground">Customer reviews from the storefront will appear here to moderate.</p>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {paginated.map((r) => (
            <li key={r.id} className="px-2 py-3 sm:px-5">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                  {(r.customerName.charAt(0) || "?").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-semibold">{r.customerName}</p>
                    <Stars rating={r.rating} />
                    <ApproveBadge r={r} />
                  </div>
                  {r.body && <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.productName ? `${r.productName} · ` : ""}
                    {r.dateLabel}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!r.approved && (
                    <button
                      onClick={() => handleApprove(r)}
                      disabled={busyId === r.id}
                      aria-label="Approve"
                      className="rounded-lg p-1.5 text-green-600 hover:bg-green-50 disabled:opacity-50"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button onClick={() => setEditing(r)} aria-label="Edit" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(r)} disabled={busyId === r.id} aria-label="Delete" className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
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
        <Modal title="Add review" onClose={() => setAdding(false)}>
          <ReviewForm products={products} onDone={() => setAdding(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit review" onClose={() => setEditing(null)}>
          <ReviewForm initial={editing} products={products} onDone={() => setEditing(null)} />
        </Modal>
      )}
    </section>
  );
}
