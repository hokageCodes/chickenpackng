"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2, Egg, ChevronLeft, ChevronRight } from "lucide-react";
import { createGroup, updateGroup, deleteGroup, logEggs, type PoultryState } from "./actions";

export type Group = {
  id: string;
  type: "BROILER" | "LAYER";
  label: string;
  breed: string;
  arrivalLabel: string;
  arrivalISO: string;
  initialCount: number;
  currentCount: number;
  status: "ACTIVE" | "HARVESTING" | "CLOSED";
  expectedHarvest: string;
  houseName: string;
  eggs7: number;
};

const today = () => new Date().toISOString().slice(0, 10);
const EGG_GRADES = ["Small", "Medium", "Large", "Jumbo", "Mixed"];

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
// Age in whole weeks since arrival (broilers process ~6 wks; layers retire ~80 wks).
function ageWeeks(iso: string): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return ms < 0 ? 0 : Math.floor(ms / WEEK_MS);
}
function readiness(type: Group["type"], age: number | null, status: Group["status"]) {
  if (age == null || status === "CLOSED") return null;
  if (type === "BROILER" && age >= 6)
    return { label: "Ready to process", cls: "bg-orange-100 text-orange-700" };
  if (type === "LAYER" && age >= 80)
    return { label: "Due for disposal", cls: "bg-red-100 text-red-700" };
  return null;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";
const submitClass =
  "w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60";

function Feedback({ state }: { state: PoultryState }) {
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

function GroupForm({ initial, onDone }: { initial?: Group; onDone: () => void }) {
  const router = useRouter();
  const isEdit = !!initial;
  const [state, action, pending] = useActionState<PoultryState, FormData>(
    isEdit ? updateGroup : createGroup,
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
          <label className="block">
            <span className={labelClass}>Status</span>
            <select name="status" defaultValue={initial!.status} className={inputClass}>
              <option value="ACTIVE">Active</option>
              <option value="HARVESTING">Harvesting</option>
              <option value="CLOSED">Closed</option>
            </select>
          </label>
        ) : (
          <label className="block">
            <span className={labelClass}>Type</span>
            <select name="type" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Select…
              </option>
              <option value="BROILER">Broiler (batch)</option>
              <option value="LAYER">Layer (flock)</option>
            </select>
          </label>
        )}
        <label className="block">
          <span className={labelClass}>Name</span>
          <input type="text" name="label" required defaultValue={initial?.label} placeholder="Batch A" className={inputClass} />
        </label>
        {isEdit && (
          <label className="block">
            <span className={labelClass}>Arrival date</span>
            <input type="date" name="arrivalDate" required defaultValue={initial?.arrivalISO} max={today()} className={inputClass} />
          </label>
        )}
        {!isEdit && (
          <>
            <label className="block">
              <span className={labelClass}>Quantity placed</span>
              <input type="number" name="initialCount" min={1} required placeholder="150" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Arrival date</span>
              <input type="date" name="arrivalDate" required defaultValue={today()} max={today()} className={inputClass} />
            </label>
          </>
        )}
        <label className="block">
          <span className={labelClass}>Breed (optional)</span>
          <input type="text" name="breed" defaultValue={initial?.breed} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>House (optional)</span>
          <input type="text" name="houseName" defaultValue={initial?.houseName} className={inputClass} />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Expected harvest (optional)</span>
          <input type="date" name="expectedHarvest" defaultValue={initial?.expectedHarvest} className={inputClass} />
        </label>
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Create group"}
      </button>
    </form>
  );
}

function EggForm({ group, onDone }: { group: Group; onDone: () => void }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<PoultryState, FormData>(logEggs, {});
  useEffect(() => {
    if (state.success) {
      router.refresh();
      onDone();
    }
  }, [state.success, onDone, router]);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="groupId" value={group.id} />
      <p className="text-sm text-muted-foreground">
        Logging eggs for <span className="font-semibold text-foreground">{group.label}</span>
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Eggs collected</span>
          <input type="number" name="collected" min={0} required placeholder="0" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Broken (optional)</span>
          <input type="number" name="broken" min={0} defaultValue={0} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Grade (optional)</span>
          <select name="grade" defaultValue="" className={inputClass}>
            <option value="">— not graded —</option>
            {EGG_GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Date</span>
          <input type="date" name="date" required defaultValue={today()} max={today()} className={inputClass} />
        </label>
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving…" : "Log eggs"}
      </button>
    </form>
  );
}

const STATUS_STYLE: Record<Group["status"], string> = {
  ACTIVE: "bg-green-100 text-green-700",
  HARVESTING: "bg-amber-100 text-amber-700",
  CLOSED: "bg-muted text-muted-foreground",
};

export default function PoultryEntries({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [egging, setEgging] = useState<Group | null>(null);
  const [filter, setFilter] = useState<"ALL" | "BROILER" | "LAYER">("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = groups.filter((g) => filter === "ALL" || g.type === filter);

  const pageSize = 6;
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [filter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  async function handleDelete(g: Group) {
    if (!confirm(`Delete ${g.label}?`)) return;
    setBusyId(g.id);
    const res = await deleteGroup(g.id);
    setBusyId(null);
    if (!res.ok) {
      alert(res.error ?? "Could not delete.");
      return;
    }
    router.refresh();
  }

  const filterOptions = [
    { value: "ALL" as const, label: "All" },
    { value: "BROILER" as const, label: "Broilers" },
    { value: "LAYER" as const, label: "Layers" },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium outline-none focus:border-primary sm:hidden"
        >
          {filterOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="hidden rounded-lg border border-border bg-muted p-0.5 sm:inline-flex">
          {filterOptions.map((o) => (
            <button
              key={o.value}
              onClick={() => setFilter(o.value)}
              className={
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors " +
                (filter === o.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")
              }
            >
              {o.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          Add group
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
          {groups.length === 0
            ? "No groups yet. Tap “Add group” to create a broiler batch or layer flock."
            : "No groups match this filter."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paginated.map((g) => {
            const lost = g.initialCount - g.currentCount;
            const age = ageWeeks(g.arrivalISO);
            const ready = readiness(g.type, age, g.status);
            return (
              <div key={g.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold">{g.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {g.breed || (g.type === "BROILER" ? "Broiler" : "Layer")} · Arrived {g.arrivalLabel}
                      {age != null ? ` · ${age} wk${age === 1 ? "" : "s"} old` : ""}
                    </p>
                  </div>
                  <span
                    className={
                      "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide " +
                      (g.type === "BROILER" ? "bg-primary/10 text-primary" : "bg-gold/20 text-gold-foreground")
                    }
                  >
                    {g.type === "BROILER" ? "Broiler" : "Layer"}
                  </span>
                </div>

                <div className="mt-3 flex items-end gap-2">
                  <p className="text-3xl font-extrabold leading-none">{g.currentCount}</p>
                  <p className="text-xs text-muted-foreground">/ {g.initialCount} birds</p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className={"rounded-md px-1.5 py-0.5 font-semibold " + STATUS_STYLE[g.status]}>
                    {g.status.charAt(0) + g.status.slice(1).toLowerCase()}
                  </span>
                  {ready && (
                    <span className={"rounded-md px-1.5 py-0.5 font-semibold " + ready.cls}>
                      {ready.label}
                    </span>
                  )}
                  {lost > 0 && <span className="text-red-600">−{lost} lost</span>}
                  {g.type === "LAYER" && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Egg size={12} /> {g.eggs7} eggs · 7d
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                  {g.type === "LAYER" && (
                    <button
                      onClick={() => setEgging(g)}
                      className="inline-flex items-center gap-1 rounded-lg bg-gold/20 px-2.5 py-1.5 text-xs font-semibold text-gold-foreground transition-colors hover:bg-gold/30"
                    >
                      <Egg size={14} /> Log eggs
                    </button>
                  )}
                  <button
                    onClick={() => setEditing(g)}
                    className="ml-auto rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(g)}
                    disabled={busyId === g.id}
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

      {filtered.length > pageSize && (
        <div className="flex items-center justify-between">
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
        <Modal title="Add poultry group" onClose={() => setAdding(false)}>
          <GroupForm onDone={() => setAdding(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title={`Edit ${editing.label}`} onClose={() => setEditing(null)}>
          <GroupForm initial={editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
      {egging && (
        <Modal title="Log eggs" onClose={() => setEgging(null)}>
          <EggForm group={egging} onDone={() => setEgging(null)} />
        </Modal>
      )}
    </section>
  );
}
