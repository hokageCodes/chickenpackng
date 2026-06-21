"use client";

import { useActionState, useRef, useEffect } from "react";
import { logMortality, type MortalityState } from "./actions";

export type TargetOption = { value: string; label: string };

const today = () => new Date().toISOString().slice(0, 10);

export default function MortalityForm({ targets }: { targets: TargetOption[] }) {
  const [state, formAction, isPending] = useActionState<MortalityState, FormData>(
    logMortality,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5"
    >
      <h2 className="text-sm font-semibold text-neutral-700">Log a death</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">Animal group / pond</span>
          <select
            name="target"
            required
            defaultValue=""
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary"
          >
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

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">Date</span>
          <input
            type="date"
            name="date"
            required
            defaultValue={today()}
            max={today()}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">Quantity</span>
          <input
            type="number"
            name="quantity"
            min={1}
            required
            placeholder="0"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">Possible cause</span>
          <input
            type="text"
            name="cause"
            placeholder="e.g. heat, disease"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-neutral-700">Notes</span>
        <textarea
          name="notes"
          rows={2}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">{state.success}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
      >
        {isPending ? "Saving…" : "Log death"}
      </button>
    </form>
  );
}
