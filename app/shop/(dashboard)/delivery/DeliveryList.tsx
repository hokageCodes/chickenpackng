"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2, MapPin } from "lucide-react";
import { createZone, updateZone, deleteZone, toggleZone, type ZoneState } from "./actions";

export type Zone = {
  id: string;
  name: string;
  areas: string;
  fee: number;
  minOrder: number;
  eta: string;
  active: boolean;
};

const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

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

function ZoneForm({ initial, onDone }: { initial?: Zone; onDone: () => void }) {
  const router = useRouter();
  const isEdit = !!initial;
  const [state, action, pending] = useActionState<ZoneState, FormData>(isEdit ? updateZone : createZone, {});
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
        <span className={labelClass}>Zone name</span>
        <input name="name" required defaultValue={initial?.name} placeholder="Lagos Mainland" className={inputClass} />
      </label>
      <label className="block">
        <span className={labelClass}>Areas covered</span>
        <textarea name="areas" rows={2} defaultValue={initial?.areas} placeholder="Yaba, Surulere, Ikeja…" className={inputClass} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Delivery fee (₦)</span>
          <input type="number" name="fee" min={0} required defaultValue={initial?.fee ?? 0} placeholder="2500" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Minimum order (₦)</span>
          <input type="number" name="minOrder" min={0} required defaultValue={initial?.minOrder ?? 0} placeholder="5000" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>ETA</span>
          <input name="eta" defaultValue={initial?.eta} placeholder="Same day" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>&nbsp;</span>
          <label className="flex h-[38px] items-center gap-2 rounded-lg border border-border px-3 text-sm">
            <input type="checkbox" name="active" defaultChecked={initial ? initial.active : true} className="h-4 w-4 rounded border-border" />
            Active
          </label>
        </label>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">{state.success}</p>}
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Add zone"}
      </button>
    </form>
  );
}

export default function DeliveryList({ zones }: { zones: Zone[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Zone | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleDelete(z: Zone) {
    if (!confirm(`Delete ${z.name}?`)) return;
    setBusyId(z.id);
    const res = await deleteZone(z.id);
    setBusyId(null);
    if (!res.ok) {
      alert(res.error ?? "Could not delete.");
      return;
    }
    router.refresh();
  }

  async function handleToggle(z: Zone) {
    setBusyId(z.id);
    await toggleZone(z.id, !z.active);
    setBusyId(null);
    router.refresh();
  }

  const StatusToggle = ({ z }: { z: Zone }) => (
    <button
      onClick={() => handleToggle(z)}
      disabled={busyId === z.id}
      className={
        "rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors disabled:opacity-50 " +
        (z.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-muted text-muted-foreground hover:bg-accent")
      }
      title="Toggle active"
    >
      {z.active ? "Active" : "Inactive"}
    </button>
  );

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-2 py-3 sm:px-5">
        <h2 className="text-sm font-semibold">Delivery zones</h2>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add zone</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {zones.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium">No delivery zones yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add zones with fees and minimums to power checkout.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-5 py-2.5 font-medium">Zone</th>
                  <th className="px-5 py-2.5 font-medium">Fee</th>
                  <th className="px-5 py-2.5 font-medium">Min order</th>
                  <th className="px-5 py-2.5 font-medium">ETA</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((z) => (
                  <tr key={z.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-start gap-2">
                        <MapPin size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="font-medium">{z.name}</p>
                          {z.areas && <p className="truncate text-xs text-muted-foreground">{z.areas}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold">{naira(z.fee)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{naira(z.minOrder)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{z.eta || "—"}</td>
                    <td className="px-5 py-3">
                      <StatusToggle z={z} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(z)} aria-label="Edit" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(z)} disabled={busyId === z.id} aria-label="Delete" className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
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
            {zones.map((z) => (
              <li key={z.id} className="px-2 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{z.name}</p>
                    {z.areas && <p className="truncate text-xs text-muted-foreground">{z.areas}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {naira(z.fee)} · min {naira(z.minOrder)}
                      {z.eta ? ` · ${z.eta}` : ""}
                    </p>
                    <div className="mt-1.5">
                      <StatusToggle z={z} />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => setEditing(z)} aria-label="Edit" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(z)} disabled={busyId === z.id} aria-label="Delete" className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {adding && (
        <Modal title="Add delivery zone" onClose={() => setAdding(false)}>
          <ZoneForm onDone={() => setAdding(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title={`Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <ZoneForm initial={editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
    </section>
  );
}
