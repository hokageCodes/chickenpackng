"use client";

import { useActionState, useRef, useEffect } from "react";
import { logFeedUsage, logFeedPurchase, type FeedState } from "./actions";

export type TargetOption = { value: string; label: string };

const today = () => new Date().toISOString().slice(0, 10);
const CATEGORIES = ["BROILER", "LAYER", "FISH"] as const;

const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";
const labelClass = "mb-1 block font-medium text-neutral-700";

function CategorySelect() {
  return (
    <label className="block text-sm">
      <span className={labelClass}>Feed type</span>
      <select name="category" required defaultValue="" className={inputClass}>
        <option value="" disabled>
          Select…
        </option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c.charAt(0) + c.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </label>
  );
}

function UsageForm({ targets }: { targets: TargetOption[] }) {
  const [state, action, pending] = useActionState<FeedState, FormData>(logFeedUsage, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.success) ref.current?.reset();
  }, [state.success]);

  return (
    <form ref={ref} action={action} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-neutral-700">Log usage</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <CategorySelect />
        <label className="block text-sm">
          <span className={labelClass}>Bags used</span>
          <input type="number" name="bags" step="0.1" min="0.1" required placeholder="0.5" className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className={labelClass}>Date</span>
          <input type="date" name="date" required defaultValue={today()} max={today()} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className={labelClass}>For (optional)</span>
          <select name="target" defaultValue="" className={inputClass}>
            <option value="">— not specified —</option>
            {targets.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">{state.success}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Log usage"}
      </button>
    </form>
  );
}

function PurchaseForm() {
  const [state, action, pending] = useActionState<FeedState, FormData>(logFeedPurchase, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.success) ref.current?.reset();
  }, [state.success]);

  return (
    <form ref={ref} action={action} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-neutral-700">Log purchase</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <CategorySelect />
        <label className="block text-sm">
          <span className={labelClass}>Bags purchased</span>
          <input type="number" name="bags" step="0.1" min="0.1" required placeholder="10" className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className={labelClass}>Total cost (₦)</span>
          <input type="number" name="costNGN" step="0.01" min="0" required placeholder="0" className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className={labelClass}>Vendor (optional)</span>
          <input type="text" name="vendor" placeholder="Supplier name" className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className={labelClass}>Date</span>
          <input type="date" name="date" required defaultValue={today()} max={today()} className={inputClass} />
        </label>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">{state.success}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Log purchase"}
      </button>
    </form>
  );
}

export default function FeedForms({ targets }: { targets: TargetOption[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <UsageForm targets={targets} />
      <PurchaseForm />
    </div>
  );
}
