// Ties harvest volume to money.
//
// Every harvest is produce leaving the farm, so it implies an amount of income
// at the farm-gate price. Comparing that expectation against the revenue
// actually logged surfaces the gap the owner cares about: produce that left but
// was never paid for (or never recorded).
//
// Broken eggs are excluded from the expectation — they were collected but can't
// be sold, so counting them would manufacture a permanent phantom shortfall.

import { prisma } from "@/lib/db";
import { EGGS_PER_CRATE, type PriceMap } from "./produce";
import { getFarmPrices } from "./prices";

export type ExpectedLine = {
  kind: "EGGS" | "FRESH_FISH" | "FROZEN_CHICKEN";
  label: string;
  quantity: number; // crates or kg
  unit: string;
  priceNGN: number; // per unit; 0 = not priced yet
  expectedNGN: number;
};

export type Reconciliation = {
  from: Date;
  lines: ExpectedLine[];
  expectedNGN: number;
  actualNGN: number;
  differenceNGN: number; // actual − expected
  unpricedKinds: string[];
  prices: PriceMap;
};

export function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function reconcile(from: Date = startOfMonth()): Promise<Reconciliation> {
  const [prices, harvests, eggs, revAgg] = await Promise.all([
    getFarmPrices(),
    prisma.harvestRecord.findMany({
      where: { date: { gte: from } },
      select: { groupId: true, pondId: true, weightKg: true },
    }),
    prisma.eggLog.aggregate({
      where: { date: { gte: from } },
      _sum: { collected: true, broken: true },
    }),
    prisma.revenue.aggregate({ where: { date: { gte: from } }, _sum: { amountNGN: true } }),
  ]);

  let chickenKg = 0;
  let fishKg = 0;
  for (const h of harvests) {
    if (h.pondId) fishKg += Number(h.weightKg);
    else chickenKg += Number(h.weightKg);
  }

  const sellableEggs = Math.max(
    0,
    Number(eggs._sum.collected ?? 0) - Number(eggs._sum.broken ?? 0)
  );
  const crates = sellableEggs / EGGS_PER_CRATE;

  const mk = (
    kind: ExpectedLine["kind"],
    label: string,
    quantity: number,
    unit: string
  ): ExpectedLine => ({
    kind,
    label,
    quantity,
    unit,
    priceNGN: prices[kind] ?? 0,
    expectedNGN: quantity * (prices[kind] ?? 0),
  });

  const lines = [
    mk("EGGS", "Eggs", crates, "crate"),
    mk("FRESH_FISH", "Fish", fishKg, "kg"),
    mk("FROZEN_CHICKEN", "Chicken", chickenKg, "kg"),
  ].filter((l) => l.quantity > 0);

  const expectedNGN = lines.reduce((s, l) => s + l.expectedNGN, 0);
  const actualNGN = Number(revAgg._sum.amountNGN ?? 0);

  return {
    from,
    lines,
    expectedNGN,
    actualNGN,
    differenceNGN: actualNGN - expectedNGN,
    unpricedKinds: lines.filter((l) => l.priceNGN === 0).map((l) => l.label),
    prices,
  };
}
