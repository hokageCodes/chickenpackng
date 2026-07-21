import Link from "next/link";
import { Egg, Scale, TriangleAlert, CircleCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { fmtDate } from "@/lib/utils";
import { reconcile } from "@/lib/farm/reconcile";
import {
  EGGS_PER_CRATE,
  PRODUCE_LABEL,
  PRODUCE_UNIT,
  PRICED_KINDS,
  fmtCrates,
} from "@/lib/farm/produce";
import HarvestEntries from "./HarvestEntries";
import PriceList, { type PriceRow } from "./PriceList";

export const dynamic = "force-dynamic";

const naira = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");
const monthLabel = (d: Date) =>
  new Intl.DateTimeFormat("en-NG", { month: "long", year: "numeric" }).format(d);

// A gap smaller than this is rounding or haggling, not a missing sale.
const TOLERANCE_NGN = 1000;

export default async function Page() {
  const [groups, ponds, rows, eggLogs, recon] = await Promise.all([
    prisma.animalGroup.findMany({ orderBy: { label: "asc" } }),
    prisma.pond.findMany({ orderBy: { label: "asc" } }),
    prisma.harvestRecord.findMany({ orderBy: { date: "desc" } }),
    prisma.eggLog.findMany({ orderBy: { date: "desc" }, take: 20 }),
    reconcile(),
  ]);

  const targets = [
    ...groups.map((g) => ({ id: `group:${g.id}`, label: `${g.label} (group)` })),
    ...ponds.map((p) => ({ id: `pond:${p.id}`, label: `${p.label} (pond)` })),
  ];

  const rowsList = rows.map((r) => {
    const kind = r.pondId ? "FRESH_FISH" : "FROZEN_CHICKEN";
    return {
      id: r.id,
      date: fmtDate(r.date),
      targetLabel: r.groupId
        ? groups.find((g) => g.id === r.groupId)?.label
        : r.pondId
          ? ponds.find((p) => p.id === r.pondId)?.label
          : "Farm",
      quantity: r.quantity,
      weightKg: Number(r.weightKg),
      expectedNGN: Number(r.weightKg) * (recon.prices[kind] ?? 0),
    };
  });

  const eggPrice = recon.prices.EGGS ?? 0;
  const eggRows = eggLogs.map((e) => {
    const sellable = Math.max(0, e.collected - e.broken);
    return {
      id: e.id,
      date: fmtDate(e.date),
      flock: groups.find((g) => g.id === e.groupId)?.label ?? "Flock",
      collected: e.collected,
      broken: e.broken,
      grade: e.grade,
      crateText: fmtCrates(sellable),
      expectedNGN: (sellable / EGGS_PER_CRATE) * eggPrice,
    };
  });

  const priceRows: PriceRow[] = PRICED_KINDS.map((k) => ({
    kind: k,
    label: PRODUCE_LABEL[k],
    unit: PRODUCE_UNIT[k],
    priceNGN: recon.prices[k] ?? 0,
  }));

  const diff = recon.differenceNGN;
  const settled = Math.abs(diff) <= TOLERANCE_NGN;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold">Harvest</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What left the farm, what it should have earned, and whether the money came in.
        </p>
      </header>

      {/* ── Expected vs actual revenue ───────────────────────── */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            <Scale size={16} />
            Harvest vs revenue
          </h2>
          <span className="text-xs text-muted-foreground">{monthLabel(recon.from)}</span>
        </header>

        {recon.lines.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Nothing harvested this month yet.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-border">
              {recon.lines.map((l) => (
                <li key={l.kind} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{l.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.quantity.toFixed(1)} {l.unit}
                      {l.priceNGN > 0 ? ` × ${naira(l.priceNGN)}` : " · no price set"}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold tabular-nums">
                    {l.priceNGN > 0 ? naira(l.expectedNGN) : "—"}
                  </p>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-3 gap-3 border-t border-border pt-3 text-center">
              <div>
                <p className="text-lg font-extrabold tabular-nums sm:text-xl">
                  {naira(recon.expectedNGN)}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Expected
                </p>
              </div>
              <div>
                <p className="text-lg font-extrabold tabular-nums sm:text-xl">
                  {naira(recon.actualNGN)}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Logged
                </p>
              </div>
              <div>
                <p
                  className={
                    "text-lg font-extrabold tabular-nums sm:text-xl " +
                    (settled ? "" : diff < 0 ? "text-red-600" : "text-green-700")
                  }
                >
                  {diff > 0 ? "+" : ""}
                  {naira(diff)}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Difference
                </p>
              </div>
            </div>

            {recon.unpricedKinds.length > 0 ? (
              <p className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                <span>
                  No farm-gate price set for {recon.unpricedKinds.join(", ")}, so the expected
                  figure is incomplete. Set it below.
                </span>
              </p>
            ) : settled ? (
              <p className="flex items-start gap-2 rounded-xl border border-green-300 bg-green-50 p-3 text-xs text-green-900 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
                <CircleCheck size={14} className="mt-0.5 shrink-0" />
                <span>Revenue matches what this month’s harvest should have earned.</span>
              </p>
            ) : (
              <p className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                <span>
                  {diff < 0 ? (
                    <>
                      {naira(Math.abs(diff))} less revenue than this month’s harvest should have
                      earned — produce sold on credit, sold below price, or a sale not yet logged
                      in{" "}
                      <Link href="/farm/finance" className="font-semibold underline">
                        Finance
                      </Link>
                      .
                    </>
                  ) : (
                    <>
                      {naira(diff)} more revenue than this month’s harvest explains — likely sales
                      from earlier stock, or a harvest that was never recorded.
                    </>
                  )}
                </span>
              </p>
            )}
          </>
        )}
      </section>

      <PriceList rows={priceRows} />

      <HarvestEntries rows={rowsList} targets={targets} />

      {/* Egg collections (logged in Poultry, shown here as a harvest) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Egg collections
          </h2>
          <Link href="/farm/poultry" className="text-xs font-semibold text-primary hover:underline">
            Manage in Poultry
          </Link>
        </div>

        {eggRows.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            No egg collections yet.
          </div>
        ) : (
          <div className="space-y-3">
            {eggRows.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/20 text-gold-foreground">
                    <Egg size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {e.date} • {e.flock}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {e.collected} eggs → {e.crateText}
                      {e.broken > 0 ? ` • ${e.broken} broken` : ""}
                      {e.grade ? ` • grade ${e.grade}` : ""}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {e.expectedNGN > 0 ? (
                    <>
                      <p className="text-sm font-bold tabular-nums">{naira(e.expectedNGN)}</p>
                      <p className="text-[11px] text-muted-foreground">expected</p>
                    </>
                  ) : (
                    <p className="text-[11px] text-muted-foreground/70">no price set</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
