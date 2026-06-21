"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  logExpense,
  updateExpense,
  deleteExpense,
  logRevenue,
  updateRevenue,
  deleteRevenue,
  type FinanceState,
} from "./actions";

export type TargetOption = { value: string; label: string };
export type Entry = {
  id: string;
  kind: "expense" | "revenue";
  label: string;
  rawCategory: string;
  amount: number;
  date: string;
  dateLabel: string;
  party: string;
  notes: string;
  target: string;
};

const EXPENSE_CATEGORIES = [
  "FEED",
  "MEDICATION",
  "FUEL",
  "STAFF",
  "TRANSPORTATION",
  "MAINTENANCE",
  "UTILITIES",
  "OTHER",
] as const;
const REVENUE_SOURCES = ["ONLINE", "OFFLINE", "WHOLESALE"] as const;

const today = () => new Date().toISOString().slice(0, 10);
const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";
const submitClass =
  "w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60";

function Feedback({ state }: { state: FinanceState }) {
  if (state.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state.success) return <p className="text-sm text-green-600">{state.success}</p>;
  return null;
}

function TargetSelect({ targets, defaultValue }: { targets: TargetOption[]; defaultValue?: string }) {
  return (
    <label className="block">
      <span className={labelClass}>Attribute to (optional)</span>
      <select name="target" defaultValue={defaultValue ?? ""} className={inputClass}>
        <option value="">— not specified —</option>
        {targets.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ExpenseForm({
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
  const [state, action, pending] = useActionState<FinanceState, FormData>(
    isEdit ? updateExpense : logExpense,
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
          <span className={labelClass}>Category</span>
          <select name="category" required defaultValue={initial?.rawCategory ?? ""} className={inputClass}>
            <option value="" disabled>
              Select…
            </option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {title(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Amount (₦)</span>
          <input type="number" name="amountNGN" step="0.01" min="0" required defaultValue={initial?.amount} placeholder="0" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Date</span>
          <input type="date" name="date" required defaultValue={initial?.date ?? today()} max={today()} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Vendor (optional)</span>
          <input type="text" name="vendor" defaultValue={initial?.party} placeholder="Who was paid" className={inputClass} />
        </label>
        <TargetSelect targets={targets} defaultValue={initial?.target} />
        <label className="block">
          <span className={labelClass}>Notes (optional)</span>
          <input type="text" name="notes" defaultValue={initial?.notes} className={inputClass} />
        </label>
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Log expense"}
      </button>
    </form>
  );
}

function RevenueForm({
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
  const [state, action, pending] = useActionState<FinanceState, FormData>(
    isEdit ? updateRevenue : logRevenue,
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
          <span className={labelClass}>Source</span>
          <select name="source" required defaultValue={initial?.rawCategory ?? ""} className={inputClass}>
            <option value="" disabled>
              Select…
            </option>
            {REVENUE_SOURCES.map((c) => (
              <option key={c} value={c}>
                {title(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Amount (₦)</span>
          <input type="number" name="amountNGN" step="0.01" min="0" required defaultValue={initial?.amount} placeholder="0" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Date</span>
          <input type="date" name="date" required defaultValue={initial?.date ?? today()} max={today()} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Customer (optional)</span>
          <input type="text" name="customer" defaultValue={initial?.party} placeholder="Who paid" className={inputClass} />
        </label>
        <TargetSelect targets={targets} defaultValue={initial?.target} />
        <label className="block">
          <span className={labelClass}>Notes (optional)</span>
          <input type="text" name="notes" defaultValue={initial?.notes} className={inputClass} />
        </label>
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Log revenue"}
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
            (value === o.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function FinanceEntries({
  entries,
  targets,
}: {
  entries: Entry[];
  targets: TargetOption[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [addTab, setAddTab] = useState<"expense" | "revenue">("expense");
  const [editing, setEditing] = useState<Entry | null>(null);
  const [filter, setFilter] = useState<"ALL" | "revenue" | "expense">("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = entries.filter((e) => filter === "ALL" || e.kind === filter);

  const pageSize = 8;
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [filter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  async function handleDelete(e: Entry) {
    if (!confirm("Delete this transaction?")) return;
    setDeletingId(e.id);
    if (e.kind === "expense") await deleteExpense(e.id);
    else await deleteRevenue(e.id);
    router.refresh();
    setDeletingId(null);
  }

  const tabClass = (active: boolean) =>
    "rounded-md py-1.5 text-sm font-semibold transition-colors " +
    (active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground");

  const filterOptions = [
    { value: "ALL" as const, label: "All" },
    { value: "revenue" as const, label: "Revenue" },
    { value: "expense" as const, label: "Expenses" },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-2 py-3 sm:px-5">
        <h2 className="text-sm font-semibold">Transactions</h2>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Filter */}
      <div className="border-b border-border px-2 py-3 sm:hidden">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
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
        <Segmented value={filter} onChange={setFilter} options={filterOptions} />
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          {entries.length === 0
            ? "No transactions yet. Tap “Add” to log revenue or an expense."
            : "No transactions match this filter."}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {paginated.map((e) => {
            const isRev = e.kind === "revenue";
            return (
              <li key={e.id} className="flex items-center gap-2 px-2 py-3 sm:gap-3 sm:px-5">
                <span
                  className={
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full " +
                    (isRev ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")
                  }
                >
                  {isRev ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    <span className={isRev ? "text-green-700" : "text-red-600"}>
                      {isRev ? "+" : "−"}
                      {naira(e.amount)}
                    </span>{" "}
                    · {e.label}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {(e.party || (isRev ? "Sale" : "Expense")) + " · " + e.dateLabel}
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
            );
          })}
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
        <Modal title="Add transaction" onClose={() => setAdding(false)}>
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            <button onClick={() => setAddTab("expense")} className={tabClass(addTab === "expense")}>
              Expense
            </button>
            <button onClick={() => setAddTab("revenue")} className={tabClass(addTab === "revenue")}>
              Revenue
            </button>
          </div>
          {addTab === "expense" ? (
            <ExpenseForm targets={targets} onDone={() => setAdding(false)} />
          ) : (
            <RevenueForm targets={targets} onDone={() => setAdding(false)} />
          )}
        </Modal>
      )}

      {editing && (
        <Modal title={editing.kind === "revenue" ? "Edit revenue" : "Edit expense"} onClose={() => setEditing(null)}>
          {editing.kind === "revenue" ? (
            <RevenueForm targets={targets} initial={editing} onDone={() => setEditing(null)} />
          ) : (
            <ExpenseForm targets={targets} initial={editing} onDone={() => setEditing(null)} />
          )}
        </Modal>
      )}
    </section>
  );
}
