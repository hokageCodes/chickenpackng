// Per-batch cost attribution.
//
// Feed is *bought* by category (BROILER/LAYER/FISH) and *used* against a
// specific batch or pond. To answer "how much feed money went into Batch A?"
// we derive a weighted-average ₦/bag per category from all purchases, then
// charge each FeedUsage row at that rate.
//
// Deliberately computed at read time rather than frozen onto FeedUsage: the
// farm buys in bulk and logs usage against it, so a running average tracks
// reality better than a point-in-time snapshot, and it self-corrects when an
// old purchase is edited.
//
// Note the two figures are different questions and should not be summed:
//   • FEED expenses in Finance   = money spent buying feed (incl. bags still in store)
//   • allocated feed cost below  = money's worth of feed actually consumed
// The gap is feed sitting in inventory.

import { prisma } from "@/lib/db";
import type { FeedCategory } from "@/lib/generated/prisma/client";

export type CostPerBag = Record<string, number>;

/** Weighted-average ₦ per bag for each feed category. */
export async function feedCostPerBag(): Promise<CostPerBag> {
  const rows = await prisma.feedPurchase.groupBy({
    by: ["category"],
    _sum: { bags: true, costNGN: true },
  });

  const map: CostPerBag = { BROILER: 0, LAYER: 0, FISH: 0 };
  for (const r of rows) {
    const bags = Number(r._sum.bags ?? 0);
    const cost = Number(r._sum.costNGN ?? 0);
    map[r.category] = bags > 0 ? cost / bags : 0;
  }
  return map;
}

export type FeedSpendBySpecies = {
  category: FeedCategory;
  bagsBought: number;
  spentNGN: number;
  bagsUsed: number;
  usedValueNGN: number;
  bagsInStock: number;
  stockValueNGN: number;
};

/**
 * The headline the client asked for: feed money split across fish / broilers /
 * layers, separating what's been consumed from what's still in the store.
 */
export async function feedSpendBySpecies(): Promise<FeedSpendBySpecies[]> {
  const [purchases, usages, stocks, perBag] = await Promise.all([
    prisma.feedPurchase.groupBy({ by: ["category"], _sum: { bags: true, costNGN: true } }),
    prisma.feedUsage.groupBy({ by: ["category"], _sum: { bags: true } }),
    prisma.feedStock.findMany(),
    feedCostPerBag(),
  ]);

  const cats: FeedCategory[] = ["BROILER", "LAYER", "FISH"];
  return cats.map((category) => {
    const p = purchases.find((x) => x.category === category);
    const u = usages.find((x) => x.category === category);
    const s = stocks.find((x) => x.category === category);
    const rate = perBag[category] ?? 0;

    const bagsUsed = Number(u?._sum.bags ?? 0);
    const bagsInStock = Number(s?.bags ?? 0);

    return {
      category,
      bagsBought: Number(p?._sum.bags ?? 0),
      spentNGN: Number(p?._sum.costNGN ?? 0),
      bagsUsed,
      usedValueNGN: bagsUsed * rate,
      bagsInStock,
      stockValueNGN: bagsInStock * rate,
    };
  });
}

export type BatchPnL = {
  key: string; // "group:<id>" | "pond:<id>"
  label: string;
  kind: "group" | "pond";
  type: string; // BROILER | LAYER | Catfish…
  status: string;
  currentCount: number;
  feedCostNGN: number; // allocated from consumption
  otherCostNGN: number; // directly-attributed non-feed expenses
  totalCostNGN: number;
  revenueNGN: number;
  profitNGN: number;
};

/**
 * Profit and loss per batch/pond. Costs = allocated feed + expenses tagged to
 * that batch; revenue = Revenue rows tagged to it. Anything the owner never
 * tagged stays out and is reported separately as unattributed.
 */
export async function batchPnL(): Promise<{ rows: BatchPnL[]; untaggedCostNGN: number; untaggedRevenueNGN: number }> {
  const [groups, ponds, usages, expenses, revenues, perBag, untaggedExp, untaggedRev] =
    await Promise.all([
      prisma.animalGroup.findMany({ orderBy: { label: "asc" } }),
      prisma.pond.findMany({ orderBy: { label: "asc" } }),
      prisma.feedUsage.groupBy({ by: ["category", "groupId", "pondId"], _sum: { bags: true } }),
      prisma.expense.groupBy({ by: ["groupId", "pondId"], _sum: { amountNGN: true } }),
      prisma.revenue.groupBy({ by: ["groupId", "pondId"], _sum: { amountNGN: true } }),
      feedCostPerBag(),
      prisma.expense.aggregate({
        _sum: { amountNGN: true },
        where: { groupId: null, pondId: null, feedPurchaseId: null },
      }),
      prisma.revenue.aggregate({ _sum: { amountNGN: true }, where: { groupId: null, pondId: null } }),
    ]);

  const feedByKey = new Map<string, number>();
  for (const u of usages) {
    const key = u.groupId ? `group:${u.groupId}` : u.pondId ? `pond:${u.pondId}` : null;
    if (!key) continue;
    const cost = Number(u._sum.bags ?? 0) * (perBag[u.category] ?? 0);
    feedByKey.set(key, (feedByKey.get(key) ?? 0) + cost);
  }

  const sumByKey = (
    rows: { groupId: string | null; pondId: string | null; _sum: { amountNGN: unknown } }[]
  ) => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const key = r.groupId ? `group:${r.groupId}` : r.pondId ? `pond:${r.pondId}` : null;
      if (!key) continue;
      m.set(key, (m.get(key) ?? 0) + Number(r._sum.amountNGN ?? 0));
    }
    return m;
  };

  const expByKey = sumByKey(expenses);
  const revByKey = sumByKey(revenues);

  const build = (
    key: string,
    label: string,
    kind: "group" | "pond",
    type: string,
    status: string,
    currentCount: number
  ): BatchPnL => {
    const feedCostNGN = feedByKey.get(key) ?? 0;
    const otherCostNGN = expByKey.get(key) ?? 0;
    const revenueNGN = revByKey.get(key) ?? 0;
    const totalCostNGN = feedCostNGN + otherCostNGN;
    return {
      key,
      label,
      kind,
      type,
      status,
      currentCount,
      feedCostNGN,
      otherCostNGN,
      totalCostNGN,
      revenueNGN,
      profitNGN: revenueNGN - totalCostNGN,
    };
  };

  const rows: BatchPnL[] = [
    ...groups.map((g) =>
      build(`group:${g.id}`, g.label, "group", g.type, g.status, g.currentCount)
    ),
    ...ponds.map((p) => build(`pond:${p.id}`, p.label, "pond", p.species, "ACTIVE", p.currentCount)),
  ];

  return {
    rows,
    untaggedCostNGN: Number(untaggedExp._sum.amountNGN ?? 0),
    untaggedRevenueNGN: Number(untaggedRev._sum.amountNGN ?? 0),
  };
}
