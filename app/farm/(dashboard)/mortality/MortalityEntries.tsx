"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2, Skull, ChevronLeft, ChevronRight } from "lucide-react";
import {
  logMortality,
  updateMortality,
  deleteMortality,
  type MortalityState,
} from "./actions";

export type TargetOption = { value: string; label: string };
export type Entry = {
  id: string;
  date: string; // yyyy-mm-dd
  dateLabel: string;
  animalType: string;
  location: string;
  target: string; // "group:x" | "pond:x"
  quantity: number;
  cause: string;
  notes: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";
const submitClass =
  "w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60";

function Feedback({ state }: { state: MortalityState }) {
  if (state.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state.success) return <p className="text-sm text-green-600">{state.success}</p>;
  return null;
}

function MortalityForm({
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
  const [state, action, pending] = useActionState<MortalityState, FormData>(
    isEdit ? updateMortality : logMortality,
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
          <div className="sm:col-span-2">
            <span className={labelClass}>Animal group / pond</span>
            <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">
              {initial!.location} · {cap(initial!.animalType)}
            </div>
          </div>
        ) : (
          <label className="block sm:col-span-2">
            <span className={labelClass}>Animal group / pond</span>
            <select name="target" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Select…
              </option>
              {targets.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block">
          <span className={labelClass}>Quantity</span>
          <input
            type="number"
            name="quantity"
            min={1}
            required
            defaultValue={initial?.quantity}
            placeholder="0"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Date</span>
          <input
            type="date"
            name="date"
            required
            defaultValue={initial?.date ?? today()}
            max={today()}
            className={inputClass}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Possible cause (optional)</span>
          <input type="text" name="cause" defaultValue={initial?.cause} placeholder="e.g. heat, disease" className={inputClass} />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Notes (optional)</span>
          <textarea name="notes" rows={2} defaultValue={initial?.notes} className={inputClass} />
        </label>
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Log death"}
      </button>
    </form>
  );
}

function Modal({
  title,
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

export default function MortalityEntries({
  entries,
  targets,
}: {
  entries: Entry[];
  targets: TargetOption[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [type, setType] = useState<string>("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const types = Array.from(new Set(entries.map((e) => e.animalType)));
  const filtered = entries.filter((e) => type === "ALL" || e.animalType === type);

  const pageSize = 8;
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [type]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  async function handleDelete(e: Entry) {
    if (!confirm("Delete this record? The animal count will be restored.")) return;
    setDeletingId(e.id);
    await deleteMortality(e.id);
    router.refresh();
    setDeletingId(null);
  }

  const filterOptions = [
    { value: "ALL", label: "All" },
    ...types.map((t) => ({ value: t, label: cap(t) })),
  ];

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-2 py-3 sm:px-5">
        <h2 className="text-sm font-semibold">Records</h2>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          Log death
        </button>
      </div>

      {/* Filter — dropdown on mobile, segmented on desktop */}
      {types.length > 1 && (
        <>
          <div className="border-b border-border px-2 py-3 sm:hidden">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {filterOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden border-b border-border px-5 py-3 sm:block">
            <Segmented value={type} onChange={setType} options={filterOptions} />
          </div>
        </>
      )}

      {filtered.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          {entries.length === 0
            ? "No deaths recorded yet. Tap “Log death” to add one."
            : "No records match this filter."}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {paginated.map((e) => (
            <li key={e.id} className="flex items-center gap-2 px-2 py-3 sm:gap-3 sm:px-5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                <Skull size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {e.quantity} {e.animalType} death{e.quantity !== 1 ? "s" : ""} · {e.location}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {(e.cause || "No cause noted") + " · " + e.dateLabel}
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

      {adding && (
        <Modal title="Log a death" onClose={() => setAdding(false)}>
          <MortalityForm targets={targets} onDone={() => setAdding(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit record" onClose={() => setEditing(null)}>
          <MortalityForm targets={targets} initial={editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
    </section>
  );
}
