"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export type PoultryState = { error?: string; success?: string };

function done() {
  revalidatePath("/farm/poultry");
  revalidatePath("/farm");
}

const createSchema = z.object({
  type: z.enum(["BROILER", "LAYER"]),
  label: z.string().trim().min(1, "Name is required"),
  breed: z.string().trim().optional(),
  arrivalDate: z.string().min(1, "Arrival date is required"),
  initialCount: z.coerce.number().int().positive("Count must be at least 1"),
  expectedHarvest: z.string().optional(),
  houseName: z.string().trim().optional(),
});

export async function createGroup(
  _prev: PoultryState,
  formData: FormData
): Promise<PoultryState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = createSchema.safeParse({
    type: formData.get("type"),
    label: formData.get("label"),
    breed: formData.get("breed"),
    arrivalDate: formData.get("arrivalDate"),
    initialCount: formData.get("initialCount"),
    expectedHarvest: formData.get("expectedHarvest"),
    houseName: formData.get("houseName"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { type, label, breed, arrivalDate, initialCount, expectedHarvest, houseName } = parsed.data;

  try {
    await prisma.animalGroup.create({
      data: {
        type,
        label,
        breed: breed || null,
        arrivalDate: new Date(arrivalDate),
        initialCount,
        currentCount: initialCount,
        expectedHarvest: expectedHarvest ? new Date(expectedHarvest) : null,
        houseName: houseName || null,
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
  breed: z.string().trim().optional(),
  expectedHarvest: z.string().optional(),
  houseName: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "HARVESTING", "CLOSED"]),
});

export async function updateGroup(
  _prev: PoultryState,
  formData: FormData
): Promise<PoultryState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const id = String(formData.get("id") ?? "");
  const parsed = updateSchema.safeParse({
    label: formData.get("label"),
    breed: formData.get("breed"),
    expectedHarvest: formData.get("expectedHarvest"),
    houseName: formData.get("houseName"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { label, breed, expectedHarvest, houseName, status } = parsed.data;

  try {
    await prisma.animalGroup.update({
      where: { id },
      data: {
        label,
        breed: breed || null,
        expectedHarvest: expectedHarvest ? new Date(expectedHarvest) : null,
        houseName: houseName || null,
        status,
      },
    });
  } catch {
    return { error: "Could not update. Please try again." };
  }
  done();
  return { success: "Updated." };
}

export async function deleteGroup(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." };

  const [mort, harv, egg, health, feed, exp, rev] = await Promise.all([
    prisma.mortalityRecord.count({ where: { groupId: id } }),
    prisma.harvestRecord.count({ where: { groupId: id } }),
    prisma.eggLog.count({ where: { groupId: id } }),
    prisma.healthEvent.count({ where: { groupId: id } }),
    prisma.feedUsage.count({ where: { groupId: id } }),
    prisma.expense.count({ where: { groupId: id } }),
    prisma.revenue.count({ where: { groupId: id } }),
  ]);
  if (mort + harv + egg + health + feed + exp + rev > 0) {
    return {
      ok: false,
      error: "This group has linked records. Set its status to Closed instead of deleting.",
    };
  }

  try {
    await prisma.animalGroup.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Could not delete." };
  }
  done();
  return { ok: true };
}

const eggSchema = z.object({
  groupId: z.string().min(1, "Flock is required"),
  date: z.string().min(1, "Date is required"),
  collected: z.coerce.number().int().nonnegative("Cannot be negative"),
  grade: z.string().optional(),
  broken: z.coerce.number().int().nonnegative("Cannot be negative").default(0),
});

export async function logEggs(
  _prev: PoultryState,
  formData: FormData
): Promise<PoultryState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = eggSchema.safeParse({
    groupId: formData.get("groupId"),
    date: formData.get("date"),
    collected: formData.get("collected"),
    grade: formData.get("grade"),
    broken: formData.get("broken"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { groupId, date, collected, grade, broken } = parsed.data;

  try {
    await prisma.eggLog.create({
      data: {
        groupId,
        date: new Date(date),
        collected,
        grade: grade || null,
        broken,
        createdById: session.user.id,
      },
    });
  } catch {
    return { error: "Could not save egg log. Please try again." };
  }
  done();
  return { success: `Logged ${collected} egg${collected !== 1 ? "s" : ""}.` };
}
