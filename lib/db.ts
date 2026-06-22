import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
}

let client: PrismaClient;

if (process.env.NODE_ENV === "production") {
  client = createClient();
} else {
  // Dev: the generated client changes whenever `prisma generate` runs (after a
  // migration). This module reloads when that happens, so drop the previous
  // (now-stale) client and create a fresh one — that way HMR picks up new models
  // without needing a manual server restart. Disconnect the old one to avoid
  // leaking connections across reloads.
  if (globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect().catch(() => {});
  }
  client = createClient();
  globalForPrisma.prisma = client;
}

export const prisma = client;
