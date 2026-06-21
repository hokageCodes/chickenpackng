"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2, Fish } from "lucide-react";
import { createPond, updatePond, deletePond, type FishState } from "./actions";

export type Pond = {
  id: string;
  label: string;
  species: string;
  quantityStocked: number;
  currentCount: number;
  stockedDate: string;
  stockedLabel: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";
const submitClass =
  "w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60";

function Feedback({ state }: { state: FishState }) {
  if (state.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state.success) return <p className="text-sm text-green-600">{state.success}</p>;
  return null;
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

function PondForm({ initial, onDone }: { initial?: Pond; onDone: () => void }) {
  const router = useRouter();
  const isEdit = !!initial;
  const [state, action, pending] = useActionState<FishState, FormData>(
    isEdit ? updatePond : createPond,
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
          <span className={labelClass}>Pond name</span>
          <input type="text" name="label" required defaultValue={initial?.label} placeholder="Pond 1" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Species</span>
          <input type="text" name="species" defaultValue={initial?.species ?? "Catfish"} placeholder="Catfish" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>{isEdit ? "Total stocked" : "Quantity stocked"}</span>
          <input type="number" name="quantityStocked" min={0} required defaultValue={initial?.quantityStocked ?? 0} placeholder="0" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Stocked date</span>
          <input type="date" name="stockedDate" required defaultValue={initial?.stockedDate ?? today()} max={today()} className={inputClass} />
        </label>
      </div>
      {isEdit && (
        <p className="text-xs text-muted-foreground">
          Changing total stocked adjusts the live count by the difference (e.g. a restock).
        </p>
      )}
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Create pond"}
      </button>
    </form>
  );
}

export default function FishEntries({ ponds }: { ponds: Pond[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Pond | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleDelete(p: Pond) {
    if (!confirm(`Delete ${p.label}?`)) return;
    setBusyId(p.id);
    const res = await deletePond(p.id);
    setBusyId(null);
    if (!res.ok) {
      alert(res.error ?? "Could not delete.");
      return;
    }
    router.refresh();
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Ponds</h2>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          Add pond
        </button>
      </div>

      {ponds.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
          No ponds yet. Tap “Add pond” to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ponds.map((p) => {
            const lost = p.quantityStocked - p.currentCount;
            return (
              <div key={p.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold">{p.label}</p>
                    <p className="text-xs text-muted-foreground">Stocked {p.stockedLabel}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-600">
                    <Fish size={11} /> {p.species}
                  </span>
                </div>

                <div className="mt-3 flex items-end gap-2">
                  <p className="text-3xl font-extrabold leading-none">{p.currentCount}</p>
                  <p className="text-xs text-muted-foreground">/ {p.quantityStocked} stocked</p>
                </div>

                {lost > 0 && <p className="mt-2 text-xs text-red-600">−{lost} lost</p>}

                <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                  <button
                    onClick={() => setEditing(p)}
                    className="ml-auto rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={busyId === p.id}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {adding && (
        <Modal title="Add pond" onClose={() => setAdding(false)}>
          <PondForm onDone={() => setAdding(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title={`Edit ${editing.label}`} onClose={() => setEditing(null)}>
          <PondForm initial={editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
    </section>
  );
}
