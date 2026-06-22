import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Owner account ─────────────────────────────────────────
  const email = process.env.OWNER_EMAIL ?? "owner@sinumagro.com";
  const name = process.env.OWNER_NAME ?? "Sinum Agro Owner";
  const password = process.env.OWNER_PASSWORD ?? "changeme123";
  const passwordHash = bcrypt.hashSync(password, 10);

  // Only set the name when first creating the owner — the DB is the source of
  // truth after that, so re-seeding never overwrites a name edited in-app/DB.
  const owner = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, passwordHash, role: "OWNER" },
  });
  const createdById = owner.id;
  console.log(`✓ Owner: ${email}`);

  // ── Livestock (from discovery: 150 broilers, 200 layers) ──
  await prisma.animalGroup.upsert({
    where: { id: "seed-broiler-batch-a" },
    update: {},
    create: {
      id: "seed-broiler-batch-a",
      type: "BROILER",
      label: "Batch A",
      arrivalDate: new Date(),
      initialCount: 150,
      currentCount: 150,
      createdById,
    },
  });
  await prisma.animalGroup.upsert({
    where: { id: "seed-layer-flock-a" },
    update: {},
    create: {
      id: "seed-layer-flock-a",
      type: "LAYER",
      label: "Flock A",
      arrivalDate: new Date(),
      initialCount: 200,
      currentCount: 200,
      createdById,
    },
  });
  console.log("✓ Livestock: Batch A (150 broilers), Flock A (200 layers)");

  // ── Fish (2 catfish ponds) ────────────────────────────────
  for (const n of [1, 2]) {
    await prisma.pond.upsert({
      where: { id: `seed-pond-${n}` },
      update: {},
      create: {
        id: `seed-pond-${n}`,
        label: `Pond ${n}`,
        species: "Catfish",
        quantityStocked: 0,
        currentCount: 0,
        stockedDate: new Date(),
        createdById,
      },
    });
  }
  console.log("✓ Fish: 2 catfish ponds");

  // ── Feed stock (Broiler 4, Layer 10, Fish 6 bags) ─────────
  const feed: Array<["BROILER" | "LAYER" | "FISH", number]> = [
    ["BROILER", 4],
    ["LAYER", 10],
    ["FISH", 6],
  ];
  for (const [category, bags] of feed) {
    await prisma.feedStock.upsert({
      where: { category },
      update: { bags, capacityBags: bags },
      create: { category, bags, capacityBags: bags },
    });
  }
  console.log("✓ Feed stock: Broiler 4, Layer 10, Fish 6 bags");

  // ── Medication stock ──────────────────────────────────────
  const meds = ["Doxygen", "Tylodox", "Amprolium", "Multivitamin"];
  for (const name of meds) {
    await prisma.medication.upsert({
      where: { id: `seed-med-${name.toLowerCase()}` },
      update: {},
      create: {
        id: `seed-med-${name.toLowerCase()}`,
        name,
        quantity: 1,
        remaining: 1,
        createdById,
      },
    });
  }
  console.log(`✓ Medications: ${meds.join(", ")}`);

  // ── Commerce catalog (real Protein Pack products) ─────────
  // Per-unit pricing (₦/kg or ₦/crate) with a minimum order quantity.
  // NOTE: Live Chicken & Live Catfish prices are placeholders — edit in admin.
  const catalog: Array<{
    name: string;
    category: string;
    image: string;
    description: string;
    unit: string;
    price: number;
    minQty: number;
    step: number;
  }> = [
    { name: "Chicken Laps", category: "Frozen Chicken", image: "/assets/laps.jpg", description: "Frozen chicken thighs, sold by weight.", unit: "kg", price: 5500, minQty: 1, step: 1 },
    { name: "Chicken Chest", category: "Frozen Chicken", image: "/assets/chi.webp", description: "Frozen chicken breast/chest, lean and high in protein.", unit: "kg", price: 6000, minQty: 1, step: 1 },
    { name: "Chicken Wings", category: "Frozen Chicken", image: "/assets/wings.jpg", description: "Frozen chicken wings, sold by weight.", unit: "kg", price: 7000, minQty: 1, step: 1 },
    { name: "Live Chicken", category: "Live", image: "/assets/hen.webp", description: "Whole live birds, sold by weight in bulk.", unit: "kg", price: 3000, minQty: 200, step: 1 },
    { name: "Eggs", category: "Eggs", image: "/assets/farm.jpg", description: "Farm-fresh eggs from our layer flocks.", unit: "crate", price: 5500, minQty: 1, step: 1 },
    { name: "Live Catfish", category: "Live", image: "/assets/raw.jpg", description: "Live catfish, sold by weight in bulk.", unit: "kg", price: 2800, minQty: 200, step: 1 },
    { name: "Smoked Catfish", category: "Fish", image: "/assets/enjoy.jpg", description: "Slow-smoked catfish, ready to cook.", unit: "kg", price: 20000, minQty: 0.5, step: 0.5 },
  ];

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Remove stale products from the old catalog model.
  await prisma.product.deleteMany({
    where: { slug: { in: ["full-chicken", "chicken-breast", "crate-of-eggs", "fresh-catfish"] } },
  });

  for (const p of catalog) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(p.category) },
      update: { name: p.category },
      create: { name: p.category, slug: slugify(p.category) },
    });
    const slug = slugify(p.name);
    await prisma.product.upsert({
      where: { slug },
      update: {
        name: p.name,
        categoryId: category.id,
        description: p.description,
        image: p.image,
        unit: p.unit,
        pricePerUnitNGN: p.price,
        minQty: p.minQty,
        step: p.step,
      },
      create: {
        name: p.name,
        slug,
        categoryId: category.id,
        description: p.description,
        image: p.image,
        unit: p.unit,
        pricePerUnitNGN: p.price,
        minQty: p.minQty,
        step: p.step,
      },
    });
  }
  console.log(`✓ Catalog: ${catalog.length} products (per-unit pricing)`);

  // ── Delivery zones (placeholder fees — edit in admin) ─────
  const zones = [
    { name: "Lagos Mainland", areas: "Yaba, Surulere, Ikeja, Maryland, Gbagada", feeNGN: 2500, minOrderNGN: 5000, eta: "Same day" },
    { name: "Lagos Island", areas: "Lekki, Victoria Island, Ikoyi, Ajah", feeNGN: 3500, minOrderNGN: 5000, eta: "Same day" },
    { name: "Outside Lagos", areas: "Ogun, Ibadan and nearby states", feeNGN: 6000, minOrderNGN: 20000, eta: "1–3 days" },
  ];
  for (const z of zones) {
    await prisma.deliveryZone.upsert({
      where: { name: z.name },
      update: {},
      create: z,
    });
  }
  console.log(`✓ Delivery zones: ${zones.length}`);

  console.log("\nSeed complete. Frozen stock = 0 (no inventory rows yet).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
