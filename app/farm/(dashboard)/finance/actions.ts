"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export type FinanceState = { error?: string; success?: string };

const EXPENSE_CATEGORIES = [
  "FEED",
  "MEDICATION",
  "FUEL",
  "STAFF",
  "TRANSPORTATION",
  "MAINTENANCE",
  "UTILITIES",
  "OTHER",
] as const;

const schema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  amountNGN: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  vendor: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  target: z.string().optional(),
});

export async function logExpense(
  _prev: FinanceState,
  formData: FormData
): Promise<FinanceState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = schema.safeParse({
    category: formData.get("category"),
    amountNGN: formData.get("amountNGN"),
    date: formData.get("date"),
    vendor: formData.get("vendor"),
    notes: formData.get("notes"),
    target: formData.get("target"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { category, amountNGN, date, vendor, notes, target } = parsed.data;

  let groupId: string | undefined;
  let pondId: string | undefined;
  if (target && target.includes(":")) {
    const [kind, id] = target.split(":");
    if (kind === "group") groupId = id;
    else if (kind === "pond") pondId = id;
  }

  try {
    await prisma.expense.create({
      data: {
        category,
        amountNGN,
        date: new Date(date),
        vendor,
        notes,
        groupId,
        pondId,
        createdById: session.user.id,
      },
    });
  } catch {
    return { error: "Could not save the expense. Please try again." };
  }

  revalidatePath("/farm/finance");
  revalidatePath("/farm");
  return { success: `Logged ₦${amountNGN.toLocaleString("en-NG")}.` };
}

/* ---------- shared ---------- */

function targetIds(target?: string): { groupId: string | null; pondId: string | null } {
  if (target && target.includes(":")) {
    const [kind, id] = target.split(":");
    if (kind === "group") return { groupId: id, pondId: null };
    if (kind === "pond") return { groupId: null, pondId: id };
  }
  return { groupId: null, pondId: null };
}

function done(): void {
  revalidatePath("/farm/finance");
  revalidatePath("/farm");
}

/* ---------- expense edit / delete ---------- */

export async function updateExpense(
  _prev: FinanceState,
  formData: FormData
): Promise<FinanceState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const id = String(formData.get("id") ?? "");
  const parsed = schema.safeParse({
    category: formData.get("category"),
    amountNGN: formData.get("amountNGN"),
    date: formData.get("date"),
    vendor: formData.get("vendor"),
    notes: formData.get("notes"),
    target: formData.get("target"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { category, amountNGN, date, vendor, notes, target } = parsed.data;
  const { groupId, pondId } = targetIds(target);

  try {
    await prisma.expense.update({
      where: { id },
      data: {
        category,
        amountNGN,
        date: new Date(date),
        vendor: vendor ?? null,
        notes: notes ?? null,
        groupId,
        pondId,
      },
    });
  } catch {
    return { error: "Could not update. Please try again." };
  }
  done();
  return { success: "Expense updated." };
}

export async function deleteExpense(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.expense.delete({ where: { id } }).catch(() => {});
  done();
}

/* ---------- revenue ---------- */

const REVENUE_SOURCES = ["ONLINE", "OFFLINE", "WHOLESALE"] as const;

const revenueSchema = z.object({
  source: z.enum(REVENUE_SOURCES),
  amountNGN: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  customer: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  target: z.string().optional(),
});

export async function logRevenue(
  _prev: FinanceState,
  formData: FormData
): Promise<FinanceState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = revenueSchema.safeParse({
    source: formData.get("source"),
    amountNGN: formData.get("amountNGN"),
    date: formData.get("date"),
    customer: formData.get("customer"),
    notes: formData.get("notes"),
    target: formData.get("target"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { source, amountNGN, date, customer, notes, target } = parsed.data;
  const { groupId, pondId } = targetIds(target);

  try {
    await prisma.revenue.create({
      data: {
        source,
        amountNGN,
        date: new Date(date),
        customer: customer ?? null,
        notes: notes ?? null,
        groupId,
        pondId,
        createdById: session.user.id,
      },
    });
  } catch {
    return { error: "Could not save the revenue. Please try again." };
  }
  done();
  return { success: `Logged ₦${amountNGN.toLocaleString("en-NG")}.` };
}

export async function updateRevenue(
  _prev: FinanceState,
  formData: FormData
): Promise<FinanceState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const id = String(formData.get("id") ?? "");
  const parsed = revenueSchema.safeParse({
    source: formData.get("source"),
    amountNGN: formData.get("amountNGN"),
    date: formData.get("date"),
    customer: formData.get("customer"),
    notes: formData.get("notes"),
    target: formData.get("target"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { source, amountNGN, date, customer, notes, target } = parsed.data;
  const { groupId, pondId } = targetIds(target);

  try {
    await prisma.revenue.update({
      where: { id },
      data: {
        source,
        amountNGN,
        date: new Date(date),
        customer: customer ?? null,
        notes: notes ?? null,
        groupId,
        pondId,
      },
    });
  } catch {
    return { error: "Could not update. Please try again." };
  }
  done();
  return { success: "Revenue updated." };
}

export async function deleteRevenue(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.revenue.delete({ where: { id } }).catch(() => {});
  done();
}
