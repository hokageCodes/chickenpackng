"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2, Pill } from "lucide-react";
import {
  createMedication,
  updateMedication,
  deleteMedication,
  createHealthEvent,
  updateHealthEvent,
  deleteHealthEvent,
  type MedicationState,
} from "./actions";

type Med = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  purchaseDate?: string | null;
  expiryDate?: string | null;
  remaining: number;
};

type Event = {
  id: string;
  type: string;
  date: string;
  targetLabel?: string | null;
  medicationId?: string | null;
  dosage?: string | null;
  notes?: string | null;
};

const today = () => new Date().toISOString().slice(0, 10);

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";
const submitClass =
  "w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60";

function Feedback({ state }: { state: MedicationState }) {
  if (state.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state.success) return <p className="text-sm text-green-600">{state.success}</p>;
  return null;
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

function MedicationForm({ initial, onDone }: { initial?: Med; onDone: () => void }) {
  const isEdit = !!initial;
  const router = useRouter();
  const [state, action, pending] = useActionState<MedicationState, FormData>(isEdit ? updateMedication : createMedication, {});

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onDone();
    }
  }, [state.success, onDone, router]);

  return (
    <form action={action} className="space-y-3">
      {isEdit && <input type="hidden" name="id" value={initial!.id} />}
      <label className="block">
        <span className={labelClass}>Name</span>
        <input name="name" required defaultValue={initial?.name} className={inputClass} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Quantity</span>
          <input type="number" name="quantity" min={0} required defaultValue={initial?.quantity ?? 0} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Unit</span>
          <input name="unit" defaultValue={initial?.unit ?? "unit"} className={inputClass} />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Purchase date</span>
          <input type="date" name="purchaseDate" defaultValue={initial?.purchaseDate ?? today()} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Expiry date</span>
          <input type="date" name="expiryDate" defaultValue={initial?.expiryDate ?? ""} className={inputClass} />
        </label>
      </div>
      <label className="block">
        <span className={labelClass}>Remaining</span>
        <input type="number" name="remaining" min={0} defaultValue={initial?.remaining ?? initial?.quantity ?? 0} className={inputClass} />
      </label>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Add medication"}
      </button>
    </form>
  );
}

function HealthForm({ initial, meds, targets, onDone }: { initial?: Event; meds: Med[]; targets: { id: string; label: string }[]; onDone: () => void }) {
  const isEdit = !!initial;
  const router = useRouter();
  const [state, action, pending] = useActionState<MedicationState, FormData>(isEdit ? updateHealthEvent : createHealthEvent, {});

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
          <span className={labelClass}>Type</span>
          <select name="type" defaultValue={initial?.type ?? "MEDICATION"} className={inputClass}>
            <option value="VACCINATION">VACCINATION</option>
            <option value="MEDICATION">MEDICATION</option>
            <option value="VET_VISIT">VET_VISIT</option>
            <option value="OUTBREAK">OUTBREAK</option>
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Date</span>
          <input type="date" name="date" defaultValue={initial?.date ?? today()} className={inputClass} />
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Target</span>
        <select name="target" defaultValue={initial?.targetLabel ?? ""} className={inputClass}>
          <option value="">— whole farm —</option>
          {targets.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={labelClass}>Medication</span>
        <select name="medicationId" defaultValue={initial?.medicationId ?? ""} className={inputClass}>
          <option value="">— none —</option>
          {meds.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={labelClass}>Dosage</span>
        <input name="dosage" defaultValue={initial?.dosage ?? ""} className={inputClass} />
      </label>
      <label className="block">
        <span className={labelClass}>Notes</span>
        <textarea name="notes" defaultValue={initial?.notes ?? ""} className={inputClass} />
      </label>

      <Feedback state={state} />
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Log event"}
      </button>
    </form>
  );
}

export default function MedicationEntries({ meds, events, targets }: { meds: Med[]; events: Event[]; targets: { id: string; label: string }[] }) {
  const router = useRouter();
  const [addingMed, setAddingMed] = useState(false);
  const [editingMed, setEditingMed] = useState<Med | null>(null);
  const [busyMedId, setBusyMedId] = useState<string | null>(null);

  const [addingEvent, setAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [busyEventId, setBusyEventId] = useState<string | null>(null);

  async function handleDeleteMed(m: Med) {
    if (!confirm(`Delete ${m.name}?`)) return;
    setBusyMedId(m.id);
    const res = await deleteMedication(m.id);
    setBusyMedId(null);
    if (!res.ok) {
      alert(res.error ?? "Could not delete.");
      return;
    }
    router.refresh();
  }

  async function handleDeleteEvent(e: Event) {
    if (!confirm(`Delete event on ${e.date}?`)) return;
    setBusyEventId(e.id);
    await deleteHealthEvent(e.id);
    setBusyEventId(null);
    router.refresh();
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Medication stock</h2>
        <button onClick={() => setAddingMed(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus size={16} /> Add
        </button>
      </div>

      {meds.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">No medications yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {meds.map((m) => (
            <div key={m.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-base font-bold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.quantity} {m.unit}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  <Pill size={11} /> Stock
                </span>
              </div>

              <div className="mt-3 flex items-end gap-2">
                <p className="text-3xl font-extrabold leading-none">{m.remaining}</p>
                <p className="text-xs text-muted-foreground">/ {m.quantity} {m.unit}</p>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                <button onClick={() => setEditingMed(m)} className="ml-auto rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDeleteMed(m)} disabled={busyMedId === m.id} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {addingMed && (
        <Modal title="Add medication" onClose={() => setAddingMed(false)}>
          <MedicationForm onDone={() => setAddingMed(false)} />
        </Modal>
      )}
      {editingMed && (
        <Modal title={`Edit ${editingMed.name}`} onClose={() => setEditingMed(null)}>
          <MedicationForm initial={editingMed} onDone={() => setEditingMed(null)} />
        </Modal>
      )}

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Health events</h2>
        <button onClick={() => setAddingEvent(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus size={16} /> Log
        </button>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">No events yet.</div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{e.type} — {e.date}</p>
                <p className="mt-1 text-xs text-muted-foreground">{e.targetLabel ?? "Whole farm"} {e.medicationId ? "• med" : ""}</p>
                {e.notes && <p className="mt-2 text-xs text-muted-foreground">{e.notes}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingEvent(e)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDeleteEvent(e)} disabled={busyEventId === e.id} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {addingEvent && (
        <Modal title="Log health event" onClose={() => setAddingEvent(false)}>
          <HealthForm meds={meds} targets={targets} onDone={() => setAddingEvent(false)} />
        </Modal>
      )}
      {editingEvent && (
        <Modal title="Edit health event" onClose={() => setEditingEvent(null)}>
          <HealthForm initial={editingEvent} meds={meds} targets={targets} onDone={() => setEditingEvent(null)} />
        </Modal>
      )}
    </section>
  );
}
