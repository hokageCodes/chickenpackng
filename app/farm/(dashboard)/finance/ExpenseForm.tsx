"use client";

import { useActionState, useRef, useEffect } from "react";
import { logExpense, type FinanceState } from "./actions";

export type TargetOption = { value: string; label: string };

const CATEGORIES = [
  "FEED",
  "MEDICATION",
  "FUEL",
  "STAFF",
  "TRANSPORTATION",
  "MAINTENANCE",
  "UTILITIES",
  "OTHER",
] as const;

const today = () => new Date().toISOString().slice(0, 10);
const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block font-medium text-neutral-700";
const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default function ExpenseForm({ targets }: { targets: TargetOption[] }) {
  const [state, action, pending] = useActionState<FinanceState, FormData>(logExpense, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.success) ref.current?.reset();
  }, [state.success]);

  return (
    <form ref={ref} action={action} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-neutral-700">Log an expense</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className={labelClass}>Category</span>
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
        <label className="block text-sm">
          <span className={labelClass}>Amount (₦)</span>
          <input type="number" name="amountNGN" step="0.01" min="0" required placeholder="0" className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className={labelClass}>Date</span>
          <input type="date" name="date" required defaultValue={today()} max={today()} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className={labelClass}>Vendor (optional)</span>
          <input type="text" name="vendor" placeholder="Who was paid" className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className={labelClass}>Attribute to (optional)</span>
          <select name="target" defaultValue="" className={inputClass}>
            <option value="">— not specified —</option>
            {targets.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className={labelClass}>Notes (optional)</span>
          <input type="text" name="notes" className={inputClass} />
        </label>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">{state.success}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Log expense"}
      </button>
    </form>
  );
}
