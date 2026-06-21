"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export type FeedState = { error?: string; success?: string };

const category = z.enum(["BROILER", "LAYER", "FISH"]);

const usageSchema = z.object({
  category,
  bags: z.coerce.number().positive("Bags must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  target: z.string().optional(),
});

const purchaseSchema = z.object({
  category,
  bags: z.coerce.number().positive("Bags must be greater than 0"),
  costNGN: z.coerce.number().nonnegative("Cost can't be negative"),
  vendor: z.string().trim().optional(),
  date: z.string().min(1, "Date is required"),
});

export async function logFeedUsage(
  _prev: FeedState,
  formData: FormData
): Promise<FeedState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = usageSchema.safeParse({
    category: formData.get("category"),
    bags: formData.get("bags"),
    date: formData.get("date"),
    target: formData.get("target"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { category: cat, bags, date, target } = parsed.data;
  const stock = await prisma.feedStock.findUnique({ where: { category: cat } });
  const current = stock?.bags ?? 0;
  if (bags > current) {
    return { error: `Only ${current} bag(s) of ${cat.toLowerCase()} feed in stock.` };
  }

  let groupId: string | undefined;
  let pondId: string | undefined;
  if (target && target.includes(":")) {
    const [kind, id] = target.split(":");
    if (kind === "group") groupId = id;
    else if (kind === "pond") pondId = id;
  }

  try {
    await prisma.$transaction([
      prisma.feedUsage.create({
        data: { category: cat, bags, date: new Date(date), groupId, pondId, createdById: session.user.id },
      }),
      prisma.feedStock.update({
        where: { category: cat },
        data: { bags: { decrement: bags } },
      }),
    ]);
  } catch {
    return { error: "Could not save usage. Please try again." };
  }

  revalidatePath("/farm/feed");
  revalidatePath("/farm");
  return { success: `Logged ${bags} bag(s) used.` };
}

export async function logFeedPurchase(
  _prev: FeedState,
  formData: FormData
): Promise<FeedState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = purchaseSchema.safeParse({
    category: formData.get("category"),
    bags: formData.get("bags"),
    costNGN: formData.get("costNGN"),
    vendor: formData.get("vendor"),
    date: formData.get("date"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { category: cat, bags, costNGN, vendor, date } = parsed.data;

  const existing = await prisma.feedStock.findUnique({ where: { category: cat } });
  const newBags = (existing?.bags ?? 0) + bags;
  // Capacity tracks the peak stock so the dashboard gauge has a "full" baseline.
  const newCapacity = Math.max(existing?.capacityBags ?? 0, newBags);

  try {
    await prisma.$transaction([
      prisma.feedPurchase.create({
        data: { category: cat, bags, costNGN, vendor, date: new Date(date), createdById: session.user.id },
      }),
      prisma.feedStock.upsert({
        where: { category: cat },
        update: { bags: newBags, capacityBags: newCapacity },
        create: { category: cat, bags, capacityBags: bags },
      }),
    ]);
  } catch {
    return { error: "Could not save purchase. Please try again." };
  }

  revalidatePath("/farm/feed");
  revalidatePath("/farm");
  return { success: `Added ${bags} bag(s) to stock.` };
}
