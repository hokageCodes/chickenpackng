// Server-side access to the farm-gate price list.

import { prisma } from "@/lib/db";
import { PRODUCE_UNIT, type PriceMap } from "./produce";

/**
 * Current farm-gate prices as a plain `kind -> ₦/unit` map. Missing rows read
 * as 0, which the UI renders as "price not set" rather than a bogus ₦0
 * expectation.
 */
export async function getFarmPrices(): Promise<PriceMap> {
  const rows = await prisma.farmPrice.findMany().catch(() => []);
  const map: PriceMap = {};
  for (const k of Object.keys(PRODUCE_UNIT)) map[k] = 0;
  for (const r of rows) map[r.kind] = Number(r.priceNGN);
  return map;
}
