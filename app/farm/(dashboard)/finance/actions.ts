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
