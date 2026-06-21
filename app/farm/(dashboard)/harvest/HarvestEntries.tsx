"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2, Package } from "lucide-react";
import { logHarvest, updateHarvest, deleteHarvest, type HarvestState } from "./actions";

type HarvestRow = { id: string; date: string; targetLabel?: string | null; quantity: number; weightKg: number };

const today = () => new Date().toISOString().slice(0, 10);
const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";
const submitClass = "w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60";

function Feedback({ state }: { state: HarvestState }) {
  if (state.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state.success) return <p className="text-sm text-green-600">{state.success}</p>;
  return null;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-muted-foreground hover:bg-accent"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function HarvestForm({ initial, targets, onDone }: { initial?: HarvestRow; targets: { id: string; label: string }[]; onDone: () => void }) {
  const isEdit = !!initial;
  const router = useRouter();
  const [state, action, pending] = useActionState<HarvestState, FormData>(isEdit ? updateHarvest : logHarvest, {});
  useEffect(() => { if (state.success) { router.refresh(); onDone(); } }, [state.success, onDone, router]);

  return (
    <form action={action} className="space-y-3">
      {isEdit && <input type="hidden" name="id" value={initial!.id} />}
      <label className="block">
        <span className={labelClass}>Target</span>
        <select name="target" required defaultValue={initial?.targetLabel ?? targets[0]?.id ?? ""} className={inputClass}>
          {targets.map((t) => (<option key={t.id} value={t.id}>{t.label}</option>))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className={labelClass}>Date</span><input type="date" name="date" defaultValue={initial?.date ?? today()} className={inputClass} /></label>
        <label className="block"><span className={labelClass}>Quantity</span><input type="number" name="quantity" min={1} required defaultValue={initial?.quantity ?? 1} className={inputClass} /></label>
      </div>
      <label className="block"><span className={labelClass}>Weight (kg)</span><input type="number" step="0.1" name="weightKg" min={0.1} required defaultValue={initial?.weightKg ?? 1} className={inputClass} /></label>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={submitClass}>{pending ? "Saving…" : isEdit ? "Save changes" : "Record harvest"}</button>
    </form>
  );
}

export default function HarvestEntries({ rows, targets }: { rows: HarvestRow[]; targets: { id: string; label: string }[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<HarvestRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleDelete(r: HarvestRow) {
    if (!confirm(`Delete harvest on ${r.date}?`)) return;
    setBusyId(r.id);
    await deleteHarvest(r.id);
    setBusyId(null);
    router.refresh();
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Harvest records</h2>
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"><Plus size={16} /> Add</button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">No harvests yet.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{r.date} — {r.targetLabel}</p>
                <p className="mt-1 text-xs text-muted-foreground">Qty {r.quantity} • {r.weightKg} kg</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(r)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Edit"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(r)} disabled={busyId === r.id} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50" aria-label="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && (<Modal title="Record harvest" onClose={() => setAdding(false)}><HarvestForm targets={targets} onDone={() => setAdding(false)} /></Modal>)}
      {editing && (<Modal title="Edit harvest" onClose={() => setEditing(null)}><HarvestForm initial={editing} targets={targets} onDone={() => setEditing(null)} /></Modal>)}
    </section>
  );
}
