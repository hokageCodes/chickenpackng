"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export type HarvestState = { error?: string; success?: string };

const schema = z.object({
  target: z.string().regex(/^(group|pond):.+$/, "Select an animal group or pond"),
  date: z.string().min(1, "Date is required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  weightKg: z.coerce.number().positive("Weight must be greater than 0"),
});

function done() {
  revalidatePath("/farm/harvest");
  revalidatePath("/farm");
}

/* ---------- farm-gate price list ---------- */

const priceSchema = z.object({
  kind: z.enum(["EGGS", "FRESH_FISH", "SMOKED_FISH", "FROZEN_CHICKEN"]),
  unit: z.string().trim().min(1),
  priceNGN: z.coerce.number().nonnegative("Price can't be negative"),
});

export async function setFarmPrice(_prev: HarvestState, formData: FormData): Promise<HarvestState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = priceSchema.safeParse({
    kind: formData.get("kind"),
    unit: formData.get("unit"),
    priceNGN: formData.get("priceNGN"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { kind, unit, priceNGN } = parsed.data;

  try {
    await prisma.farmPrice.upsert({
      where: { kind },
      update: { unit, priceNGN },
      create: { kind, unit, priceNGN },
    });
  } catch {
    return { error: "Could not save the price. Please try again." };
  }

  done();
  revalidatePath("/farm/finance");
  revalidatePath("/farm/analytics");
  return { success: "Price updated." };
}

export async function logHarvest(_prev: HarvestState, formData: FormData): Promise<HarvestState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = schema.safeParse({
    target: formData.get("target"),
    date: formData.get("date"),
    quantity: formData.get("quantity"),
    weightKg: formData.get("weightKg"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { target, date, quantity, weightKg } = parsed.data;
  const [kind, id] = target.split(":") as ["group" | "pond", string];
  const when = new Date(date);

  try {
    if (kind === "group") {
      const group = await prisma.animalGroup.findUnique({ where: { id } });
      if (!group) return { error: "Animal group not found." };
      if (quantity > group.currentCount) return { error: `Only ${group.currentCount} birds remain in ${group.label}.` };

      await prisma.$transaction(async (tx) => {
        await tx.harvestRecord.create({ data: { date: when, groupId: id, quantity, weightKg, createdById: session.user.id } });
        await tx.animalGroup.update({ where: { id }, data: { currentCount: { decrement: quantity } } });
        const label = `group:${id}:FROZEN_CHICKEN`;
        const inv = await tx.inventory.findFirst({ where: { label } });
        if (inv) {
          await tx.inventory.update({ where: { id: inv.id }, data: { quantity: { increment: weightKg } } });
        } else {
          await tx.inventory.create({ data: { kind: "FROZEN_CHICKEN", label, quantity: weightKg, unit: "kg" } });
        }
      });
    } else {
      const pond = await prisma.pond.findUnique({ where: { id } });
      if (!pond) return { error: "Pond not found." };
      if (quantity > pond.currentCount) return { error: `Only ${pond.currentCount} fish remain in ${pond.label}.` };

      await prisma.$transaction(async (tx) => {
        await tx.harvestRecord.create({ data: { date: when, pondId: id, quantity, weightKg, createdById: session.user.id } });
        await tx.pond.update({ where: { id }, data: { currentCount: { decrement: quantity } } });
        const label = `pond:${id}:FRESH_FISH`;
        const inv = await tx.inventory.findFirst({ where: { label } });
        if (inv) {
          await tx.inventory.update({ where: { id: inv.id }, data: { quantity: { increment: weightKg } } });
        } else {
          await tx.inventory.create({ data: { kind: "FRESH_FISH", label, quantity: weightKg, unit: "kg" } });
        }
      });
    }
  } catch (e) {
    console.error(e);
    return { error: "Could not save the harvest. Please try again." };
  }

  done();
  return { success: `Harvested ${quantity}.` };
}

const editSchema = z.object({
  date: z.string().min(1, "Date is required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  weightKg: z.coerce.number().positive("Weight must be greater than 0"),
});

export async function updateHarvest(_prev: HarvestState, formData: FormData): Promise<HarvestState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const id = String(formData.get("id") ?? "");
  const parsed = editSchema.safeParse({
    date: formData.get("date"),
    quantity: formData.get("quantity"),
    weightKg: formData.get("weightKg"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { date, quantity, weightKg } = parsed.data;
  const old = await prisma.harvestRecord.findUnique({ where: { id } });
  if (!old) return { error: "Record not found." };

  try {
    if (old.groupId) {
      const gid = old.groupId;
      const group = await prisma.animalGroup.findUnique({ where: { id: gid } });
      if (!group) return { error: "Animal group not found." };
      const available = group.currentCount + old.quantity; // reverse old
      if (quantity > available) return { error: `Only ${available} birds available in ${group.label}.` };

      const deltaKg = weightKg - Number(old.weightKg);
      await prisma.$transaction(async (tx) => {
        await tx.harvestRecord.update({ where: { id }, data: { date: new Date(date), quantity, weightKg } });
        await tx.animalGroup.update({ where: { id: gid }, data: { currentCount: available - quantity } });
        const label = `group:${gid}:FROZEN_CHICKEN`;
        const inv = await tx.inventory.findFirst({ where: { label } });
        if (inv) {
          await tx.inventory.update({ where: { id: inv.id }, data: { quantity: { increment: deltaKg } } });
        } else if (deltaKg > 0) {
          await tx.inventory.create({ data: { kind: "FROZEN_CHICKEN", label, quantity: weightKg, unit: "kg" } });
        }
      });
    } else if (old.pondId) {
      const pid = old.pondId;
      const pond = await prisma.pond.findUnique({ where: { id: pid } });
      if (!pond) return { error: "Pond not found." };
      const available = pond.currentCount + old.quantity;
      if (quantity > available) return { error: `Only ${available} fish available in ${pond.label}.` };

      const deltaKg = weightKg - Number(old.weightKg);
      await prisma.$transaction(async (tx) => {
        await tx.harvestRecord.update({ where: { id }, data: { date: new Date(date), quantity, weightKg } });
        await tx.pond.update({ where: { id: pid }, data: { currentCount: available - quantity } });
        const label = `pond:${pid}:FRESH_FISH`;
        const inv = await tx.inventory.findFirst({ where: { label } });
        if (inv) {
          await tx.inventory.update({ where: { id: inv.id }, data: { quantity: { increment: deltaKg } } });
        } else if (deltaKg > 0) {
          await tx.inventory.create({ data: { kind: "FRESH_FISH", label, quantity: weightKg, unit: "kg" } });
        }
      });
    } else {
      await prisma.harvestRecord.update({ where: { id }, data: { date: new Date(date), quantity, weightKg } });
    }
  } catch (e) {
    console.error(e);
    return { error: "Could not update. Please try again." };
  }

  done();
  return { success: "Updated." };
}

export async function deleteHarvest(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const old = await prisma.harvestRecord.findUnique({ where: { id } });
  if (!old) return;

  try {
    if (old.groupId) {
      await prisma.$transaction([
        prisma.harvestRecord.delete({ where: { id } }),
        prisma.animalGroup.update({ where: { id: old.groupId }, data: { currentCount: { increment: old.quantity } } }),
        prisma.inventory.updateMany({ where: { label: `group:${old.groupId}:FROZEN_CHICKEN` }, data: { quantity: { decrement: Number(old.weightKg) } } }),
      ]);
    } else if (old.pondId) {
      await prisma.$transaction([
        prisma.harvestRecord.delete({ where: { id } }),
        prisma.pond.update({ where: { id: old.pondId }, data: { currentCount: { increment: old.quantity } } }),
        prisma.inventory.updateMany({ where: { label: `pond:${old.pondId}:FRESH_FISH` }, data: { quantity: { decrement: Number(old.weightKg) } } }),
      ]);
    } else {
      await prisma.harvestRecord.delete({ where: { id } });
    }
  } catch (e) {
    console.error(e);
  }

  done();
}
