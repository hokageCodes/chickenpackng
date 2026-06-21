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

/* ---------- edit / delete (with stock reversal) ---------- */

const editUsageSchema = z.object({
  bags: z.coerce.number().positive("Bags must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  target: z.string().optional(),
});

const editPurchaseSchema = z.object({
  bags: z.coerce.number().positive("Bags must be greater than 0"),
  costNGN: z.coerce.number().nonnegative("Cost can't be negative"),
  vendor: z.string().trim().optional(),
  date: z.string().min(1, "Date is required"),
});

export async function updateFeedUsage(
  _prev: FeedState,
  formData: FormData
): Promise<FeedState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const id = String(formData.get("id") ?? "");
  const parsed = editUsageSchema.safeParse({
    bags: formData.get("bags"),
    date: formData.get("date"),
    target: formData.get("target"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { bags, date, target } = parsed.data;
  const old = await prisma.feedUsage.findUnique({ where: { id } });
  if (!old) return { error: "Entry not found." };

  const stock = await prisma.feedStock.findUnique({ where: { category: old.category } });
  const available = (stock?.bags ?? 0) + old.bags; // reverse the old usage first
  if (bags > available) {
    return { error: `Only ${available} bag(s) of ${old.category.toLowerCase()} feed available.` };
  }

  let groupId: string | null = null;
  let pondId: string | null = null;
  if (target && target.includes(":")) {
    const [kind, gid] = target.split(":");
    if (kind === "group") groupId = gid;
    else if (kind === "pond") pondId = gid;
  }

  try {
    await prisma.$transaction([
      prisma.feedUsage.update({
        where: { id },
        data: { bags, date: new Date(date), groupId, pondId },
      }),
      prisma.feedStock.update({
        where: { category: old.category },
        data: { bags: available - bags },
      }),
    ]);
  } catch {
    return { error: "Could not update. Please try again." };
  }

  revalidatePath("/farm/feed");
  revalidatePath("/farm");
  return { success: "Entry updated." };
}

export async function updateFeedPurchase(
  _prev: FeedState,
  formData: FormData
): Promise<FeedState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const id = String(formData.get("id") ?? "");
  const parsed = editPurchaseSchema.safeParse({
    bags: formData.get("bags"),
    costNGN: formData.get("costNGN"),
    vendor: formData.get("vendor"),
    date: formData.get("date"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { bags, costNGN, vendor, date } = parsed.data;
  const old = await prisma.feedPurchase.findUnique({ where: { id } });
  if (!old) return { error: "Entry not found." };

  const stock = await prisma.feedStock.findUnique({ where: { category: old.category } });
  const base = Math.max(0, (stock?.bags ?? 0) - old.bags); // reverse the old purchase
  const newBags = base + bags;
  const newCapacity = Math.max(stock?.capacityBags ?? 0, newBags);

  try {
    await prisma.$transaction([
      prisma.feedPurchase.update({
        where: { id },
        data: { bags, costNGN, vendor: vendor ?? null, date: new Date(date) },
      }),
      prisma.feedStock.update({
        where: { category: old.category },
        data: { bags: newBags, capacityBags: newCapacity },
      }),
    ]);
  } catch {
    return { error: "Could not update. Please try again." };
  }

  revalidatePath("/farm/feed");
  revalidatePath("/farm");
  return { success: "Entry updated." };
}

export async function deleteFeedEntry(kind: "usage" | "purchase", id: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  if (kind === "usage") {
    const u = await prisma.feedUsage.findUnique({ where: { id } });
    if (!u) return;
    await prisma.$transaction([
      prisma.feedUsage.delete({ where: { id } }),
      prisma.feedStock.update({
        where: { category: u.category },
        data: { bags: { increment: u.bags } }, // give the feed back
      }),
    ]);
  } else {
    const p = await prisma.feedPurchase.findUnique({ where: { id } });
    if (!p) return;
    const stock = await prisma.feedStock.findUnique({ where: { category: p.category } });
    const newBags = Math.max(0, (stock?.bags ?? 0) - p.bags); // remove the bought bags
    await prisma.$transaction([
      prisma.feedPurchase.delete({ where: { id } }),
      prisma.feedStock.update({ where: { category: p.category }, data: { bags: newBags } }),
    ]);
  }

  revalidatePath("/farm/feed");
  revalidatePath("/farm");
}
