"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2, Wheat, ChevronLeft, ChevronRight } from "lucide-react";
import {
  logFeedUsage,
  logFeedPurchase,
  updateFeedUsage,
  updateFeedPurchase,
  deleteFeedEntry,
  type FeedState,
} from "./actions";
import { bagsToKg, fmtNum } from "./units";

export type TargetOption = { value: string; label: string };
export type Entry = {
  id: string;
  kind: "usage" | "purchase";
  category: "BROILER" | "LAYER" | "FISH";
  bags: number;
  date: string; // yyyy-mm-dd
  dateLabel: string;
  detail: string;
  target: string;
  vendor: string;
  costNGN: number;
};

const CATEGORIES = ["BROILER", "LAYER", "FISH"] as const;
const today = () => new Date().toISOString().slice(0, 10);
const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";
const submitClass =
  "w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60";

function Feedback({ state }: { state: FeedState }) {
  if (state.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state.success) return <p className="text-sm text-green-600">{state.success}</p>;
  return null;
}

function CategorySelect() {
  return (
    <label className="block">
      <span className={labelClass}>Feed type</span>
      <select name="category" required defaultValue="" className={inputClass}>
        <option value="" disabled>
          Select…
        </option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {title(c)}
          </option>
        ))}
      </select>
    </label>
  );
}

function UsageForm({
  targets,
  initial,
  onDone,
}: {
  targets: TargetOption[];
  initial?: Entry;
  onDone: () => void;
}) {
  const router = useRouter();
  const isEdit = !!initial;
  const [state, action, pending] = useActionState<FeedState, FormData>(
    isEdit ? updateFeedUsage : logFeedUsage,
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
        {isEdit ? (
          <div>
            <span className={labelClass}>Feed type</span>
            <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">
              {title(initial!.category)}
            </div>
          </div>
        ) : (
          <CategorySelect />
        )}
        <label className="block">
          <span className={labelClass}>Kg used</span>
          <input
            type="number"
            name="kg"
            step="0.5"
            min="0.5"
            required
            defaultValue={initial ? fmtNum(bagsToKg(initial.bags, initial.category)) : undefined}
            placeholder="12.5"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Date</span>
          <input type="date" name="date" required defaultValue={initial?.date ?? today()} max={today()} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>For (optional)</span>
          <select name="target" defaultValue={initial?.target ?? ""} className={inputClass}>
            <option value="">— not specified —</option>
            {targets.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Log usage"}
      </button>
    </form>
  );
}

function PurchaseForm({ initial, onDone }: { initial?: Entry; onDone: () => void }) {
  const router = useRouter();
  const isEdit = !!initial;
  const [state, action, pending] = useActionState<FeedState, FormData>(
    isEdit ? updateFeedPurchase : logFeedPurchase,
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
        {isEdit ? (
          <div>
            <span className={labelClass}>Feed type</span>
            <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">
              {title(initial!.category)}
            </div>
          </div>
        ) : (
          <CategorySelect />
        )}
        <label className="block">
          <span className={labelClass}>Bags purchased (25 kg each)</span>
          <input type="number" name="bags" step="0.1" min="0.1" required defaultValue={initial?.bags} placeholder="10" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Total cost (₦)</span>
          <input type="number" name="costNGN" step="0.01" min="0" required defaultValue={initial?.costNGN} placeholder="0" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Vendor (optional)</span>
          <input type="text" name="vendor" defaultValue={initial?.vendor} placeholder="Supplier name" className={inputClass} />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Date</span>
          <input type="date" name="date" required defaultValue={initial?.date ?? today()} max={today()} className={inputClass} />
        </label>
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Add purchase"}
      </button>
    </form>
  );
}

function Modal({
  title: heading,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">{heading}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-muted-foreground hover:bg-accent">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={
            "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors " +
            (value === o.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function FeedEntries({
  entries,
  targets,
}: {
  entries: Entry[];
  targets: TargetOption[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [addTab, setAddTab] = useState<"usage" | "purchase">("usage");
  const [editing, setEditing] = useState<Entry | null>(null);
  const [cat, setCat] = useState<"ALL" | "BROILER" | "LAYER" | "FISH">("ALL");
  const [act, setAct] = useState<"ALL" | "usage" | "purchase">("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = entries.filter(
    (e) => (cat === "ALL" || e.category === cat) && (act === "ALL" || e.kind === act)
  );

  const pageSize = 8;
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [cat, act]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  async function handleDelete(e: Entry) {
    if (!confirm("Delete this entry? Stock will be adjusted back.")) return;
    setDeletingId(e.id);
    await deleteFeedEntry(e.kind, e.id);
    router.refresh();
    setDeletingId(null);
  }

  const tabClass = (active: boolean) =>
    "rounded-md py-1.5 text-sm font-semibold transition-colors " +
    (active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground");

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-2 py-3 sm:px-5">
        <h2 className="text-sm font-semibold">Recent entries</h2>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          Add entry
        </button>
      </div>

      {/* Filters — dropdowns on mobile, chips on desktop */}
      <div className="flex gap-2 border-b border-border px-2 py-3 sm:hidden">
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value as typeof cat)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="ALL">All feed</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {title(c)}
            </option>
          ))}
        </select>
        <select
          value={act}
          onChange={(e) => setAct(e.target.value as typeof act)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="ALL">All actions</option>
          <option value="usage">Used</option>
          <option value="purchase">Bought</option>
        </select>
      </div>
      <div className="hidden flex-wrap items-center gap-3 border-b border-border px-5 py-3 sm:flex">
        <Segmented<typeof cat>
          value={cat}
          onChange={setCat}
          options={[
            { value: "ALL", label: "All feed" },
            { value: "BROILER", label: "Broiler" },
            { value: "LAYER", label: "Layer" },
            { value: "FISH", label: "Fish" },
          ]}
        />
        <Segmented<typeof act>
          value={act}
          onChange={setAct}
          options={[
            { value: "ALL", label: "All" },
            { value: "usage", label: "Used" },
            { value: "purchase", label: "Bought" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          {entries.length === 0
            ? "No feed entries yet. Tap “Add entry” to log usage or a purchase."
            : "No entries match these filters."}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {paginated.map((e) => (
            <li key={`${e.kind}-${e.id}`} className="flex items-center gap-2 px-2 py-3 sm:gap-3 sm:px-5">
              <span
                className={
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full " +
                  (e.kind === "purchase"
                    ? "bg-green-100 text-green-700"
                    : "bg-muted text-muted-foreground")
                }
              >
                <Wheat size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {e.kind === "purchase"
                    ? `${fmtNum(e.bags)} bag${e.bags !== 1 ? "s" : ""} bought`
                    : `${fmtNum(bagsToKg(e.bags, e.category))} kg used`}{" "}
                  · {title(e.category)}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {e.detail} · {e.dateLabel}
                </p>
              </div>
              <button
                onClick={() => setEditing(e)}
                aria-label="Edit"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(e)}
                disabled={deletingId === e.id}
                aria-label="Delete"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
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

      {/* Add modal */}
      {adding && (
        <Modal title="Add feed entry" onClose={() => setAdding(false)}>
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            <button onClick={() => setAddTab("usage")} className={tabClass(addTab === "usage")}>
              Log usage
            </button>
            <button onClick={() => setAddTab("purchase")} className={tabClass(addTab === "purchase")}>
              Add purchase
            </button>
          </div>
          {addTab === "usage" ? (
            <UsageForm targets={targets} onDone={() => setAdding(false)} />
          ) : (
            <PurchaseForm onDone={() => setAdding(false)} />
          )}
        </Modal>
      )}

      {/* Edit modal */}
      {editing && (
        <Modal title="Edit entry" onClose={() => setEditing(null)}>
          {editing.kind === "usage" ? (
            <UsageForm targets={targets} initial={editing} onDone={() => setEditing(null)} />
          ) : (
            <PurchaseForm initial={editing} onDone={() => setEditing(null)} />
          )}
        </Modal>
      )}
    </section>
  );
}
