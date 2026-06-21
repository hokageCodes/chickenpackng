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
