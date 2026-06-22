"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateSettings, type SettingsState } from "./actions";

export type Settings = {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  whatsapp: string;
  address: string;
  currency: string;
};

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";

export default function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateSettings, {});
  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold">Store details</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={labelClass}>Store name</span>
          <input name="storeName" required defaultValue={initial.storeName} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Support email</span>
          <input type="email" name="supportEmail" defaultValue={initial.supportEmail} placeholder="hello@proteinpack.ng" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Support phone</span>
          <input name="supportPhone" defaultValue={initial.supportPhone} placeholder="080…" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>WhatsApp</span>
          <input name="whatsapp" defaultValue={initial.whatsapp} placeholder="234…" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Currency</span>
          <select name="currency" defaultValue={initial.currency || "NGN"} className={inputClass}>
            <option value="NGN">NGN (₦)</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Business address</span>
          <textarea name="address" rows={2} defaultValue={initial.address} className={inputClass} />
        </label>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
