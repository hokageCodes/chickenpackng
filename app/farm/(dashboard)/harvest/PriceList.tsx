"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, Check, Pencil } from "lucide-react";
import { setFarmPrice, type HarvestState } from "./actions";

export type PriceRow = { kind: string; label: string; unit: string; priceNGN: number };

const naira = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");

function PriceEditor({ row, onDone }: { row: PriceRow; onDone: () => void }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<HarvestState, FormData>(setFarmPrice, {});

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onDone();
    }
  }, [state.success, onDone, router]);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="kind" value={row.kind} />
      <input type="hidden" name="unit" value={row.unit} />
      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          ₦
        </span>
        <input
          type="number"
          name="priceNGN"
          min={0}
          step="any"
          required
          autoFocus
          defaultValue={row.priceNGN || ""}
          placeholder="0"
          aria-label={`Price per ${row.unit} of ${row.label}`}
          className="w-28 rounded-lg border border-border bg-background py-1.5 pl-6 pr-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary p-1.5 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        aria-label="Save price"
      >
        <Check size={16} />
      </button>
      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}

export default function PriceList({ rows }: { rows: PriceRow[] }) {
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <header>
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <Tag size={16} />
          Farm-gate prices
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          What you expect to earn per unit. Used to work out expected revenue from each harvest.
        </p>
      </header>

      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.kind} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{r.label}</p>
              <p className="text-xs text-muted-foreground">per {r.unit}</p>
            </div>

            {editing === r.kind ? (
              <PriceEditor row={r} onDone={() => setEditing(null)} />
            ) : (
              <button
                onClick={() => setEditing(r.kind)}
                className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent"
              >
                <span
                  className={
                    "text-sm font-bold tabular-nums " +
                    (r.priceNGN > 0 ? "" : "text-muted-foreground/60")
                  }
                >
                  {r.priceNGN > 0 ? naira(r.priceNGN) : "Not set"}
                </span>
                <Pencil
                  size={14}
                  className="text-muted-foreground/60 transition-colors group-hover:text-foreground"
                />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
