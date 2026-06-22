"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wheat, Pencil, X } from "lucide-react";
import { setFeedStock, type FeedState } from "./actions";
import { bagsToKg, fmtNum } from "./units";

export type Stock = {
  category: "BROILER" | "LAYER" | "FISH";
  bags: number;
  capacityBags: number;
  lowThreshold: number;
};

const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const CHIP: Record<Stock["category"], string> = {
  BROILER: "bg-primary/10 text-primary",
  LAYER: "bg-gold/20 text-gold-foreground",
  FISH: "bg-sky-100 text-sky-600",
};

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";

function Modal({ title: heading, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl bg-card p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
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

function AdjustForm({ stock, onDone }: { stock: Stock; onDone: () => void }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<FeedState, FormData>(setFeedStock, {});
  useEffect(() => {
    if (state.success) {
      router.refresh();
      onDone();
    }
  }, [state.success, onDone, router]);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="category" value={stock.category} />
      <label className="block">
        <span className={labelClass}>Current stock (kg)</span>
        <input type="number" name="kg" step="0.5" min="0" required defaultValue={fmtNum(bagsToKg(stock.bags))} className={inputClass} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelClass}>Full capacity (kg)</span>
          <input type="number" name="capacityKg" step="0.5" min="0" defaultValue={fmtNum(bagsToKg(stock.capacityBags))} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Low-stock alert (kg)</span>
          <input type="number" name="lowKg" step="0.5" min="0" defaultValue={fmtNum(bagsToKg(stock.lowThreshold))} className={inputClass} />
        </label>
      </div>
      <p className="text-[11px] text-muted-foreground">1 bag = 25 kg. Capacity sets the “full” mark on the gauge.</p>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">{state.success}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save stock"}
      </button>
    </form>
  );
}

export default function FeedStockCards({ stocks }: { stocks: Stock[] }) {
  const [editing, setEditing] = useState<Stock | null>(null);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {stocks.map((s) => {
        const cap = s.capacityBags > 0 ? s.capacityBags : s.bags;
        const pct = cap > 0 ? (s.bags / cap) * 100 : 0;
        const tone =
          pct > 50 ? "bg-green-50 text-green-700" : pct > 25 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600";
        return (
          <div key={s.category} className="flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
                  {fmtNum(s.bags)}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">bags</span>
                </p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                  {title(s.category)} feed · {fmtNum(bagsToKg(s.bags))} kg
                </p>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-12 sm:w-12 ${CHIP[s.category]}`}>
                  <Wheat size={22} />
                </span>
                <button
                  onClick={() => setEditing(s)}
                  aria-label="Adjust stock"
                  className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Pencil size={14} />
                </button>
              </div>
            </div>
            <div className={`mt-3 flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold sm:mt-4 sm:gap-2 sm:px-3 sm:text-xs ${tone}`}>
              <span className="truncate">{Math.round(pct)}% left</span>
              <span className="ml-auto shrink-0">of {fmtNum(cap)} bags</span>
            </div>
          </div>
        );
      })}

      {editing && (
        <Modal title={`Adjust ${title(editing.category)} feed`} onClose={() => setEditing(null)}>
          <AdjustForm stock={editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}
