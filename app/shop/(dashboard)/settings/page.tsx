import Link from "next/link";
import { UserCircle, CreditCard, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import SettingsForm, { type Settings } from "./SettingsForm";

export const dynamic = "force-dynamic";

function paystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY && process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY);
}

async function getData() {
  const [row, session] = await Promise.all([
    prisma.storeSetting.findUnique({ where: { id: "singleton" } }),
    auth(),
  ]);

  const settings: Settings = {
    storeName: row?.storeName ?? "Protein Pack",
    supportEmail: row?.supportEmail ?? "",
    supportPhone: row?.supportPhone ?? "",
    whatsapp: row?.whatsapp ?? "",
    address: row?.address ?? "",
    currency: row?.currency ?? "NGN",
  };

  return { settings, user: session?.user ?? null };
}

export default async function SettingsPage() {
  const d = await getData();
  const connected = paystackConfigured();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Store details and integrations</p>
      </header>

      <SettingsForm initial={d.settings} />

      <section className="grid gap-4 lg:grid-cols-2">
        {/* Account */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <UserCircle size={18} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Your account</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-base font-bold text-primary">
              {(d.user?.name ?? d.user?.email ?? "?").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{d.user?.name ?? "Owner"}</p>
              <p className="truncate text-sm text-muted-foreground">{d.user?.email}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Profile &amp; password editing is managed from the FarmOS side (coming soon).
          </p>
        </div>

        {/* Integrations */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <CreditCard size={18} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Payments (Paystack)</h2>
          </div>
          {connected ? (
            <p className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 size={16} /> Connected
            </p>
          ) : (
            <p className="flex items-center gap-2 text-sm text-amber-700">
              <AlertTriangle size={16} /> Not connected — add Paystack keys to your environment.
            </p>
          )}
          <Link
            href="/shop/payments"
            className="mt-3 inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Open Payments <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
