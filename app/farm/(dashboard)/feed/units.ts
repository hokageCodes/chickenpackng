// Bag size depends on the feed type: poultry feed is 25 kg/bag, fish feed is
// 15 kg/bag. Stock/purchases are tracked in bags; usage is entered in kg and
// converted. Shared by server actions and client components.
export const KG_PER_BAG: Record<string, number> = {
  BROILER: 25,
  LAYER: 25,
  FISH: 15,
};

export const kgPerBag = (category: string) => KG_PER_BAG[category] ?? 25;

export const bagsToKg = (bags: number, category: string) => bags * kgPerBag(category);
export const kgToBags = (kg: number, category: string) => kg / kgPerBag(category);

// Tidy number formatting (drop trailing .0).
export const fmtNum = (n: number) =>
  Number.isInteger(n) ? n.toString() : Number(n.toFixed(2)).toString();
