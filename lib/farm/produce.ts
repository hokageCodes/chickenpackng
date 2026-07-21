// Produce units and the farm-gate price list.
//
// Eggs are logged as loose eggs but sold (and counted in inventory) by the
// crate, so every egg number the owner types has a crate equivalent. Fish and
// chicken are already handled in kg by the harvest flow.

// Pure units/labels only — safe to import from client components. Anything
// that touches the database lives in `prices.ts`.

import type { InventoryKind } from "@/lib/generated/prisma/client";

export const EGGS_PER_CRATE = 30;

export const eggsToCrates = (eggs: number) => eggs / EGGS_PER_CRATE;
export const cratesToEggs = (crates: number) => crates * EGGS_PER_CRATE;

/** "4 crates + 12" — how a farmer actually reads an egg count. */
export function crateBreakdown(eggs: number) {
  const crates = Math.floor(eggs / EGGS_PER_CRATE);
  const loose = eggs % EGGS_PER_CRATE;
  return { crates, loose };
}

export function fmtCrates(eggs: number) {
  const { crates, loose } = crateBreakdown(eggs);
  if (crates === 0) return `${loose} egg${loose === 1 ? "" : "s"}`;
  if (loose === 0) return `${crates} crate${crates === 1 ? "" : "s"}`;
  return `${crates} crate${crates === 1 ? "" : "s"} + ${loose}`;
}

/** Unit each produce kind is priced and stocked in. */
export const PRODUCE_UNIT: Record<InventoryKind, string> = {
  EGGS: "crate",
  FRESH_FISH: "kg",
  SMOKED_FISH: "kg",
  FROZEN_CHICKEN: "kg",
  LIVE_POULTRY: "kg",
  LIVE_FISH: "kg",
};

/** Kinds the owner actually prices today — drives the price-list UI. */
export const PRICED_KINDS: InventoryKind[] = [
  "EGGS",
  "FRESH_FISH",
  "SMOKED_FISH",
  "FROZEN_CHICKEN",
];

export const PRODUCE_LABEL: Record<InventoryKind, string> = {
  EGGS: "Eggs",
  FRESH_FISH: "Fresh fish",
  SMOKED_FISH: "Smoked fish",
  FROZEN_CHICKEN: "Chicken",
  LIVE_POULTRY: "Live poultry",
  LIVE_FISH: "Live fish",
};

export type PriceMap = Record<string, number>;

/** Expected revenue for a harvest, in naira. Returns 0 when unpriced. */
export function expectedRevenue(kind: InventoryKind, quantity: number, prices: PriceMap) {
  return (prices[kind] ?? 0) * quantity;
}
