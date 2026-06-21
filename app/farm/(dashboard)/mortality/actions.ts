"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export type MortalityState = { error?: string; success?: string };

const schema = z.object({
  target: z.string().regex(/^(group|pond):.+$/, "Select an animal group or pond"),
  date: z.string().min(1, "Date is required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  cause: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export async function logMortality(
  _prev: MortalityState,
  formData: FormData
): Promise<MortalityState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = schema.safeParse({
    target: formData.get("target"),
    date: formData.get("date"),
    quantity: formData.get("quantity"),
    cause: formData.get("cause"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { target, date, quantity, cause, notes } = parsed.data;
  const [kind, id] = target.split(":") as ["group" | "pond", string];
  const createdById = session.user.id;
  const when = new Date(date);

  try {
    if (kind === "group") {
      const group = await prisma.animalGroup.findUnique({ where: { id } });
      if (!group) return { error: "Animal group not found." };
      if (quantity > group.currentCount) {
        return { error: `Only ${group.currentCount} birds remain in ${group.label}.` };
      }
      const animalType = group.type === "BROILER" ? "broiler" : "layer";
      await prisma.$transaction([
        prisma.mortalityRecord.create({
          data: { date: when, animalType, groupId: id, quantity, cause, notes, createdById },
        }),
        prisma.animalGroup.update({
          where: { id },
          data: { currentCount: { decrement: quantity } },
        }),
      ]);
    } else {
      const pond = await prisma.pond.findUnique({ where: { id } });
      if (!pond) return { error: "Pond not found." };
      if (quantity > pond.currentCount) {
        return { error: `Only ${pond.currentCount} fish remain in ${pond.label}.` };
      }
      await prisma.$transaction([
        prisma.mortalityRecord.create({
          data: {
            date: when,
            animalType: pond.species.toLowerCase(),
            pondId: id,
            quantity,
            cause,
            notes,
            createdById,
          },
        }),
        prisma.pond.update({
          where: { id },
          data: { currentCount: { decrement: quantity } },
        }),
      ]);
    }
  } catch {
    return { error: "Could not save the record. Please try again." };
  }

  revalidatePath("/farm/mortality");
  revalidatePath("/farm");
  return { success: `Logged ${quantity} death${quantity > 1 ? "s" : ""}.` };
}

/* ---------- edit / delete (reversing the count change) ---------- */

const editSchema = z.object({
  date: z.string().min(1, "Date is required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  cause: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export async function updateMortality(
  _prev: MortalityState,
  formData: FormData
): Promise<MortalityState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const id = String(formData.get("id") ?? "");
  const parsed = editSchema.safeParse({
    date: formData.get("date"),
    quantity: formData.get("quantity"),
    cause: formData.get("cause"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { date, quantity, cause, notes } = parsed.data;
  const old = await prisma.mortalityRecord.findUnique({ where: { id } });
  if (!old) return { error: "Record not found." };
  const when = new Date(date);

  try {
    if (old.groupId) {
      const group = await prisma.animalGroup.findUnique({ where: { id: old.groupId } });
      if (!group) return { error: "Animal group not found." };
      const available = group.currentCount + old.quantity; // reverse the old loss
      if (quantity > available) {
        return { error: `Only ${available} birds available in ${group.label}.` };
      }
      await prisma.$transaction([
        prisma.mortalityRecord.update({ where: { id }, data: { date: when, quantity, cause, notes } }),
        prisma.animalGroup.update({ where: { id: old.groupId }, data: { currentCount: available - quantity } }),
      ]);
    } else if (old.pondId) {
      const pond = await prisma.pond.findUnique({ where: { id: old.pondId } });
      if (!pond) return { error: "Pond not found." };
      const available = pond.currentCount + old.quantity;
      if (quantity > available) {
        return { error: `Only ${available} fish available in ${pond.label}.` };
      }
      await prisma.$transaction([
        prisma.mortalityRecord.update({ where: { id }, data: { date: when, quantity, cause, notes } }),
        prisma.pond.update({ where: { id: old.pondId }, data: { currentCount: available - quantity } }),
      ]);
    } else {
      await prisma.mortalityRecord.update({ where: { id }, data: { date: when, quantity, cause, notes } });
    }
  } catch {
    return { error: "Could not update. Please try again." };
  }

  revalidatePath("/farm/mortality");
  revalidatePath("/farm");
  return { success: "Record updated." };
}

export async function deleteMortality(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const old = await prisma.mortalityRecord.findUnique({ where: { id } });
  if (!old) return;

  if (old.groupId) {
    await prisma.$transaction([
      prisma.mortalityRecord.delete({ where: { id } }),
      prisma.animalGroup.update({
        where: { id: old.groupId },
        data: { currentCount: { increment: old.quantity } }, // restore the birds
      }),
    ]);
  } else if (old.pondId) {
    await prisma.$transaction([
      prisma.mortalityRecord.delete({ where: { id } }),
      prisma.pond.update({
        where: { id: old.pondId },
        data: { currentCount: { increment: old.quantity } },
      }),
    ]);
  } else {
    await prisma.mortalityRecord.delete({ where: { id } });
  }

  revalidatePath("/farm/mortality");
  revalidatePath("/farm");
}
