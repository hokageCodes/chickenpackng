"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { kgToBags, bagsToKg, fmtNum } from "./units";

export type FeedState = { error?: string; success?: string };

const category = z.enum(["BROILER", "LAYER", "FISH"]);

// Usage is entered in kg (1 bag = 25 kg) and stored as bags.
const usageSchema = z.object({
  category,
  kg: z.coerce.number().positive("Kg must be greater than 0"),
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
    kg: formData.get("kg"),
    date: formData.get("date"),
    target: formData.get("target"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { category: cat, kg, date, target } = parsed.data;
  const bags = kgToBags(kg);
  const stock = await prisma.feedStock.findUnique({ where: { category: cat } });
  const currentKg = bagsToKg(stock?.bags ?? 0);
  if (kg > currentKg) {
    return { error: `Only ${fmtNum(currentKg)} kg of ${cat.toLowerCase()} feed in stock.` };
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
  return { success: `Logged ${fmtNum(kg)} kg used.` };
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

  const uid = session.user.id;
  try {
    await prisma.$transaction(async (tx) => {
      const purchase = await tx.feedPurchase.create({
        data: { category: cat, bags, costNGN, vendor, date: new Date(date), createdById: uid },
      });
      await tx.feedStock.upsert({
        where: { category: cat },
        update: { bags: newBags, capacityBags: newCapacity },
        create: { category: cat, bags, capacityBags: bags },
      });
      // Record the purchase cost as a FEED expense in Finance.
      if (costNGN > 0) {
        await tx.expense.create({
          data: {
            category: "FEED",
            amountNGN: costNGN,
            date: new Date(date),
            vendor: vendor || null,
            notes: `${fmtNum(bags)} bag(s) ${cat.toLowerCase()} feed`,
            feedPurchaseId: purchase.id,
            createdById: uid,
          },
        });
      }
    });
  } catch {
    return { error: "Could not save purchase. Please try again." };
  }

  revalidatePath("/farm/feed");
  revalidatePath("/farm/finance");
  revalidatePath("/farm");
  return { success: `Added ${fmtNum(bags)} bag(s) to stock.` };
}

/* ---------- edit / delete (with stock reversal) ---------- */

const editUsageSchema = z.object({
  kg: z.coerce.number().positive("Kg must be greater than 0"),
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
    kg: formData.get("kg"),
    date: formData.get("date"),
    target: formData.get("target"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { kg, date, target } = parsed.data;
  const bags = kgToBags(kg);
  const old = await prisma.feedUsage.findUnique({ where: { id } });
  if (!old) return { error: "Entry not found." };

  const stock = await prisma.feedStock.findUnique({ where: { category: old.category } });
  const availableKg = bagsToKg((stock?.bags ?? 0) + old.bags); // reverse the old usage first
  if (kg > availableKg) {
    return { error: `Only ${fmtNum(availableKg)} kg of ${old.category.toLowerCase()} feed available.` };
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
        data: { bags: (stock?.bags ?? 0) + old.bags - bags },
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
  const uid = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.feedPurchase.update({
        where: { id },
        data: { bags, costNGN, vendor: vendor ?? null, date: new Date(date) },
      });
      await tx.feedStock.update({
        where: { category: old.category },
        data: { bags: newBags, capacityBags: newCapacity },
      });
      // Keep the linked FEED expense in sync.
      if (costNGN > 0) {
        await tx.expense.upsert({
          where: { feedPurchaseId: id },
          update: { amountNGN: costNGN, vendor: vendor || null, date: new Date(date), category: "FEED" },
          create: {
            category: "FEED",
            amountNGN: costNGN,
            date: new Date(date),
            vendor: vendor || null,
            notes: `${fmtNum(bags)} bag(s) ${old.category.toLowerCase()} feed`,
            feedPurchaseId: id,
            createdById: uid,
          },
        });
      } else {
        await tx.expense.deleteMany({ where: { feedPurchaseId: id } });
      }
    });
  } catch {
    return { error: "Could not update. Please try again." };
  }

  revalidatePath("/farm/feed");
  revalidatePath("/farm/finance");
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
    // Deleting the purchase cascades its linked FEED expense.
    await prisma.$transaction([
      prisma.feedPurchase.delete({ where: { id } }),
      prisma.feedStock.update({ where: { category: p.category }, data: { bags: newBags } }),
    ]);
  }

  revalidatePath("/farm/feed");
  revalidatePath("/farm/finance");
  revalidatePath("/farm");
}

/* ---------- direct stock adjustment (stock-take / correction) ---------- */

const adjustSchema = z.object({
  category,
  kg: z.coerce.number().nonnegative("Cannot be negative"),
  capacityKg: z.coerce.number().nonnegative().optional(),
  lowKg: z.coerce.number().nonnegative().optional(),
});

export async function setFeedStock(_prev: FeedState, formData: FormData): Promise<FeedState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = adjustSchema.safeParse({
    category: formData.get("category"),
    kg: formData.get("kg"),
    capacityKg: formData.get("capacityKg"),
    lowKg: formData.get("lowKg"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { category: cat, kg, capacityKg, lowKg } = parsed.data;
  const bags = kgToBags(kg);
  const existing = await prisma.feedStock.findUnique({ where: { category: cat } });

  // Capacity (gauge "full") must be at least the current amount.
  const capacityBags = Math.max(
    bags,
    capacityKg != null ? kgToBags(capacityKg) : (existing?.capacityBags ?? bags)
  );
  const lowThreshold = lowKg != null ? kgToBags(lowKg) : (existing?.lowThreshold ?? 2);

  try {
    await prisma.feedStock.upsert({
      where: { category: cat },
      update: { bags, capacityBags, lowThreshold },
      create: { category: cat, bags, capacityBags, lowThreshold },
    });
  } catch {
    return { error: "Could not update stock. Please try again." };
  }

  revalidatePath("/farm/feed");
  revalidatePath("/farm");
  return { success: `${cat.charAt(0) + cat.slice(1).toLowerCase()} stock set to ${fmtNum(kg)} kg.` };
}
