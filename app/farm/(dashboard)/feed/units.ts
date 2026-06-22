// 1 bag of feed = 25 kg. Stock/purchases are tracked in bags; usage is entered
// in kg and converted. Shared by server actions and client components.
export const KG_PER_BAG = 25;

export const bagsToKg = (bags: number) => bags * KG_PER_BAG;
export const kgToBags = (kg: number) => kg / KG_PER_BAG;

// Tidy number formatting (drop trailing .0).
export const fmtNum = (n: number) =>
  Number.isInteger(n) ? n.toString() : Number(n.toFixed(2)).toString();
