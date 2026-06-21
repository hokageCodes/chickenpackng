"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export type FishState = { error?: string; success?: string };

function done() {
  revalidatePath("/farm/fish");
  revalidatePath("/farm");
}

const createSchema = z.object({
  label: z.string().trim().min(1, "Name is required"),
  species: z.string().trim().optional(),
  quantityStocked: z.coerce.number().int().nonnegative("Cannot be negative"),
  stockedDate: z.string().min(1, "Stocked date is required"),
});

export async function createPond(
  _prev: FishState,
  formData: FormData
): Promise<FishState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = createSchema.safeParse({
    label: formData.get("label"),
    species: formData.get("species"),
    quantityStocked: formData.get("quantityStocked"),
    stockedDate: formData.get("stockedDate"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { label, species, quantityStocked, stockedDate } = parsed.data;

  try {
    await prisma.pond.create({
      data: {
        label,
        species: species || "Catfish",
        quantityStocked,
        currentCount: quantityStocked,
        stockedDate: new Date(stockedDate),
        createdById: session.user.id,
      },
    });
  } catch {
    return { error: "Could not create. Please try again." };
  }
  done();
  return { success: `${label} created.` };
}

const updateSchema = z.object({
  label: z.string().trim().min(1, "Name is required"),
  species: z.string().trim().optional(),
  quantityStocked: z.coerce.number().int().nonnegative("Cannot be negative"),
  stockedDate: z.string().min(1, "Stocked date is required"),
});

export async function updatePond(
  _prev: FishState,
  formData: FormData
): Promise<FishState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const id = String(formData.get("id") ?? "");
  const parsed = updateSchema.safeParse({
    label: formData.get("label"),
    species: formData.get("species"),
    quantityStocked: formData.get("quantityStocked"),
    stockedDate: formData.get("stockedDate"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { label, species, quantityStocked, stockedDate } = parsed.data;
  const old = await prisma.pond.findUnique({ where: { id } });
  if (!old) return { error: "Pond not found." };

  // Adjust the live count by the change in stocked quantity (a restock or correction).
  const newCurrent = old.currentCount + (quantityStocked - old.quantityStocked);
  if (newCurrent < 0) {
    return { error: `Stock can't go below the current count (${old.currentCount} after losses).` };
  }

  try {
    await prisma.pond.update({
      where: { id },
      data: {
        label,
        species: species || "Catfish",
        quantityStocked,
        currentCount: newCurrent,
        stockedDate: new Date(stockedDate),
      },
    });
  } catch {
    return { error: "Could not update. Please try again." };
  }
  done();
  return { success: "Updated." };
}

export async function deletePond(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." };

  const [mort, harv, health, feed, exp, rev] = await Promise.all([
    prisma.mortalityRecord.count({ where: { pondId: id } }),
    prisma.harvestRecord.count({ where: { pondId: id } }),
    prisma.healthEvent.count({ where: { pondId: id } }),
    prisma.feedUsage.count({ where: { pondId: id } }),
    prisma.expense.count({ where: { pondId: id } }),
    prisma.revenue.count({ where: { pondId: id } }),
  ]);
  if (mort + harv + health + feed + exp + rev > 0) {
    return { ok: false, error: "This pond has linked records and can't be deleted." };
  }

  try {
    await prisma.pond.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Could not delete." };
  }
  done();
  return { ok: true };
}
